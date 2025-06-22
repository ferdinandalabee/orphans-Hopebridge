import { pgTable, text, timestamp, varchar, integer, boolean, serial, date, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Users table - stores basic user information from Clerk
export const users = pgTable('users', {
  id: varchar('id').primaryKey(), // Clerk user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orphanages table - stores orphanage information from the dashboard form
export const orphanages = pgTable('orphanages', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  description: text('description').notNull(),
  capacity: integer('capacity').notNull(),
  website: varchar('website', { length: 255 }),
  registrationNumber: varchar('registration_number').notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const orphanageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  description: z.string().min(20, 'Please provide a detailed description'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  registrationNumber: z.string().min(5, 'Registration number is required'),
});

// Children table
export const children = pgTable('children', {
  id: varchar('id').primaryKey(),
  orphanageId: varchar('orphanage_id').notNull().references(() => orphanages.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(), // 'MALE', 'FEMALE', 'OTHER'
  photoUrl: text('photo_url'), // URL to the stored image
  bio: text('bio'),
  needs: text('needs').array(),
  interests: text('interests').array(),
  isAdopted: boolean('is_adopted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schema for children
export const childSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  photoUrl: z.string().url('Invalid image URL').optional(),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bio: z.string().optional(),
  needs: z.string().optional(),
  interests: z.string().optional(),
});

// Activity status enum
export const activityStatusEnum = pgEnum('activity_status', ['scheduled', 'completed', 'cancelled'])

// Activities table
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
});

// Volunteer profiles table
export const volunteerProfiles = pgTable('volunteer_profiles', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }).notNull(),
  skills: text('skills').array().notNull().default([]),
  availability: text('availability').array().notNull().default([]),
  about: text('about').notNull(),
  profileComplete: boolean('profile_complete').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schema for volunteer profile
export const volunteerProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number can only contain numbers'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string()
    .min(5, 'ZIP code must be 5 digits')
    .regex(/^\d+$/, 'ZIP code can only contain numbers'),
  dateOfBirth: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
    z.date()
  ]).transform(val => new Date(val)),
  emergencyContactPhone: z.string()
    .min(10, 'Emergency contact phone must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number can only contain numbers'),
  skills: z.array(z.string())
    .min(1, 'Please select at least one skill')
    .default([]),
  availability: z.array(z.string())
    .min(1, 'Please select at least one availability option')
    .default([]),
  about: z.string()
    .min(20, 'Please tell us more about yourself (at least 20 characters)')
    .max(1000, 'About section is too long (max 1000 characters)'),
  profileComplete: z.boolean().default(true)
});

// Base types
type UserBase = typeof users.$inferSelect;
type NewUserBase = typeof users.$inferInsert;

// Extended types with relationships
export type User = UserBase & {
  volunteerProfile?: VolunteerProfile;
};

export type NewUser = NewUserBase;
export type Orphanage = typeof orphanages.$inferSelect;
export type NewOrphanage = typeof orphanages.$inferInsert;
export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;
export type NewVolunteerProfile = Omit<typeof volunteerProfiles.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

// Extend the Child type to include the image file for form handling
export type Child = typeof children.$inferSelect;
export type NewChild = Omit<typeof children.$inferInsert, 'photoUrl'> & {
  image?: FileList; // For handling file upload in forms
};
