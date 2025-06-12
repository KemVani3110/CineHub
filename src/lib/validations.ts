import { z } from 'zod';

// Comment validation
export const commentSchema = z.object({
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be less than 2000 characters')
    .transform(val => val.trim()),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  is_spoiler: z.boolean().default(false),
});

export const commentUpdateSchema = commentSchema.partial();

export const commentFilterSchema = z.object({
  has_rating: z.boolean().optional(),
  has_spoilers: z.boolean().optional(),
  sort_by: z.enum(['newest', 'oldest', 'rating_high', 'rating_low']).default('newest'),
  user_id: z.number().optional(),
});

export const reviewFilterSchema = z.object({
  media_type: z.enum(['movie', 'tv']).optional(),
  rating_min: z.number().min(1).max(5).optional(),
  rating_max: z.number().min(1).max(5).optional(),
  has_spoilers: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.enum(['newest', 'oldest', 'rating_high', 'rating_low']).default('newest'),
});

// Reaction validation
export const reactionSchema = z.object({
  reaction_type: z.enum(['like', 'helpful', 'funny']),
});

export type CommentFormData = z.infer<typeof commentSchema>;
export type CommentUpdateData = z.infer<typeof commentUpdateSchema>;
export type CommentFilterData = z.infer<typeof commentFilterSchema>;
export type ReviewFilterData = z.infer<typeof reviewFilterSchema>;
export type ReactionData = z.infer<typeof reactionSchema>;