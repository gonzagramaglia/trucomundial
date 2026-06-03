import { z } from "zod";

export const tournamentSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    status: z.enum(["open", "closed", "active", "finished", "cancelled"]),
    max_participants: z
      .number()
      .min(4, "Debe haber un máximo de al menos 4 participantes")
      .max(32, "El máximo no puede superar 32"),
    min_participants: z
      .number()
      .min(4, "El mínimo de participantes debe ser al menos 4")
      .max(32, "El máximo no puede superar 32"),
    participants: z.number().optional(),
    start_time: z.string().nonempty("La fecha y hora son obligatorias"),
    prize: z
      .array(z.string().trim().min(1, "El premio no puede estar vacío"))
      .min(1, "Agregá al menos un premio"),
    bg_gradient: z.string().nonempty(),
    winner: z.string().nullable().optional(),
    organizer: z.string().nonempty("El organizador es obligatorio"),
    visibility: z.enum(["public", "unlisted", "private"]),
    code_type: z.enum(["single", "unique"]),
    codes: z.array(z.string()).optional(),
    description: z.string().optional(),
    allowed_teams: z
      .array(z.string())
      .length(4, "Debes seleccionar exactamente 4 selecciones"),
  })
  .refine((data) => data.min_participants <= data.max_participants, {
    message: "El mínimo de participantes no puede superar al máximo",
    path: ["min_participants"],
  })
  .refine((data) => data.prize.length <= data.max_participants, {
    message:
      "La cantidad de premios no puede superar el máximo de participantes",
    path: ["prize"],
  });

export type TournamentFormData = z.infer<typeof tournamentSchema>;

export const creatorApplicationSchema = z.object({
  channel_name: z.string().min(2, "El nombre del canal es obligatorio"),
  social_link: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  streaming_link: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  motivation: z
    .string()
    .min(10, "Por favor, contanos un poco más sobre por qué querés unirte.")
    .max(500, "El texto es muy largo."),
});

export type CreatorApplicationFormData = z.infer<
  typeof creatorApplicationSchema
>;

export const ticketSchema = z.object({
  subject: z
    .string()
    .min(3, "El asunto debe tener al menos 3 caracteres")
    .max(100, "El asunto es muy largo"),
  message: z
    .string()
    .min(10, "El mensaje debe ser más descriptivo")
    .max(1000, "El mensaje es muy largo"),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
