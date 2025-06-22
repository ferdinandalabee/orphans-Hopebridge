import { pgTable, serial, text, timestamp, date, pgEnum } from "drizzle-orm/pg-core"
import { volunteerProfiles } from "../schema"

export const activityStatusEnum = pgEnum('activity_status', ['scheduled', 'completed', 'cancelled'])

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  volunteerId: text('volunteer_id').notNull()
    .references(() => volunteerProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: date('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  notes: text('notes'),
  status: activityStatusEnum('status').notNull().default('scheduled'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
