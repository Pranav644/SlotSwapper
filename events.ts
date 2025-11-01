import express from 'express';
import { PrismaClient, EventStatus } from '@prisma/client';
import { authRequired } from '../auth';

const prisma = new PrismaClient();
const router = express.Router();

// Get my events
router.get('/events', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const events = await prisma.event.findMany({ where: { ownerId: userId } });
  res.json(events);
});

// Create event
router.post('/event', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const { title, startTime, endTime } = req.body;
  const event = await prisma.event.create({
    data: {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: EventStatus.BUSY,
      ownerId: userId,
    }
  });
  res.json(event);
});

// Update event status (e.g., BUSY <-> SWAPPABLE)
router.patch('/event/:id/status', authRequired, async (req, res) => {
  const userId = (req as any).userId;
  const { status } = req.body;
  const eventId = parseInt(req.params.id);
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event || event.ownerId !== userId) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status },
  });
  res.json(updated);
});

export default router;