import { z } from 'zod';
import { ServiceType, BookingStatus } from '@prisma/client';

// API Request/Response schemas
export const AvailabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const CreateBookingSchema = z.object({
  serviceId: z.string().min(1),
  petId: z.string().min(1),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  notes: z.string().optional(),
});

export const CreateHoldSchema = z.object({
  serviceId: z.string().min(1),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  clientId: z.string().min(1),
  petId: z.string().min(1),
  priceCents: z.number().int().positive(),
  notes: z.string().optional(),
});

export const UpdateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  notes: z.string().optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
});

// Pet schema
export const CreatePetSchema = z.object({
  name: z.string().min(1).max(50),
  breed: z.string().max(50).optional(),
  weightKg: z.number().positive().max(100).optional(),
  ageYears: z.number().int().positive().max(30).optional(),
  vaccinationsUrl: z.array(z.string().url()).default([]),
  notes: z.string().max(500).optional(),
  aggressive: z.boolean().default(false),
  specialCare: z.boolean().default(false),
});

export const UpdatePetSchema = CreatePetSchema.partial();

// AI Chat schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'tool']),
  content: z.string(),
  toolName: z.string().optional(),
  toolPayload: z.record(z.any()).optional(),
});

export const ChatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
});

// Service availability function schemas for AI
export const CheckAvailabilitySchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  durationHours: z.number().positive().optional(),
});

export const CreateBookingFromAISchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  petName: z.string().min(1),
  petDetails: z.object({
    breed: z.string().optional(),
    weightKg: z.number().positive().optional(),
    ageYears: z.number().int().positive().optional(),
    vaccinationsUrl: z.string().url().optional(),
    notes: z.string().optional(),
    aggressive: z.boolean().default(false),
    specialCare: z.boolean().default(false),
  }).optional(),
  notes: z.string().optional(),
});

export const HoldSlotSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  petName: z.string().min(1),
});

// Type exports
export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type CreateHold = z.infer<typeof CreateHoldSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
export type CreatePet = z.infer<typeof CreatePetSchema>;
export type UpdatePet = z.infer<typeof UpdatePetSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type CheckAvailability = z.infer<typeof CheckAvailabilitySchema>;
export type CreateBookingFromAI = z.infer<typeof CreateBookingFromAISchema>;
export type HoldSlot = z.infer<typeof HoldSlotSchema>;
