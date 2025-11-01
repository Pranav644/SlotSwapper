import express from 'express';
import { PrismaClient, EventStatus, SwapStatus } from '@prisma/client';
import { authRequired } from '../auth';

const prisma = new PrismaClient();
const router = express.Router();

// Get all swappable slots (not mine)
router.get('/swappable-slots', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const slots = await prisma.event.findMany({
    where: {
      status: EventStatus.SWAPPABLE,
      ownerId: { not: userId }
    },
    include: { owner: true }
  });
  res.json(slots);
});

// Create swap request
router.post('/swap-request', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const { mySlotId, theirSlotId } = req.body;

  const mySlot = await prisma.event.findUnique({ where: { id: mySlotId } });
  const theirSlot = await prisma.event.findUnique({ where: { id: theirSlotId } });

  if (!mySlot || !theirSlot) return res.status(404).json({ error: "Slot not found" });
  if (mySlot.ownerId !== userId) return res.status(403).json({ error: "Cannot offer other's slot" });
  if (mySlot.status !== EventStatus.SWAPPABLE || theirSlot.status !== EventStatus.SWAPPABLE)
    return res.status(400).json({ error: "Both slots must be swappable" });

  // Update both slots to SWAP_PENDING
  await prisma.event.updateMany({
    where: { id: { in: [mySlotId, theirSlotId] } },
    data: { status: EventStatus.SWAP_PENDING }
  });

  const swapRequest = await prisma.swapRequest.create({
    data: {
      mySlotId,
      theirSlotId,
      requesterId: userId,
      recipientId: theirSlot.ownerId,
      status: SwapStatus.PENDING
    }
  });
  res.json(swapRequest);
});

// Respond to swap request
router.post('/swap-response/:requestId', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const { accept } = req.body;
  const requestId = parseInt(req.params.requestId);

  const swap = await prisma.swapRequest.findUnique({
    where: { id: requestId },
    include: { mySlot: true, theirSlot: true }
  });
  if (!swap) return res.status(404).json({ error: "Swap request not found" });
  if (swap.recipientId !== userId) return res.status(403).json({ error: "Not authorized" });
  if (swap.status !== SwapStatus.PENDING) return res.status(400).json({ error: "Already processed" });

  if (!accept) {
    // Reject
    await prisma.swapRequest.update({ where: { id: requestId }, data: { status: SwapStatus.REJECTED } });
    await prisma.event.update({ where: { id: swap.mySlotId }, data: { status: EventStatus.SWAPPABLE } });
    await prisma.event.update({ where: { id: swap.theirSlotId }, data: { status: EventStatus.SWAPPABLE } });
    return res.json({ success: true });
  } else {
    // Accept: swap the owners, set both to BUSY, update request status
    await prisma.event.update({ where: { id: swap.mySlotId }, data: { ownerId: swap.recipientId, status: EventStatus.BUSY } });
    await prisma.event.update({ where: { id: swap.theirSlotId }, data: { ownerId: swap.requesterId, status: EventStatus.BUSY } });
    await prisma.swapRequest.update({ where: { id: requestId }, data: { status: SwapStatus.ACCEPTED } });
    return res.json({ success: true });
  }
});

// Get incoming/outgoing swap requests
router.get('/swap-requests', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const incoming = await prisma.swapRequest.findMany({
    where: { recipientId: userId },
    include: { mySlot: true, theirSlot: true, requester: true }
  });
  const outgoing = await prisma.swapRequest.findMany({
    where: { requesterId: userId },
    include: { mySlot: true, theirSlot: true, recipient: true }
  });
  res.json({ incoming, outgoing });
});

export default router;