CREATE TYPE "public"."body_type" AS ENUM('sedan', 'hatchback', 'wagon', 'suv', 'crossover', 'coupe', 'cabriolet', 'minivan', 'pickup', 'van');--> statement-breakpoint
CREATE TYPE "public"."drivetrain" AS ENUM('fwd', 'rwd', 'awd');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."lead_type" AS ENUM('order_request', 'contact', 'financing', 'callback');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('fixed', 'estimated');--> statement-breakpoint
CREATE TYPE "public"."transmission" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'sales_manager');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('in_stock', 'on_order', 'reserved', 'sold');--> statement-breakpoint
CREATE TABLE "features" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "features_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(64) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "features_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "lead_type" NOT NULL,
	"vehicle_id" uuid,
	"name" varchar(128) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(128),
	"message" text,
	"budget" integer,
	"reference_links" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_seller_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "makes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "makes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(64) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "makes_name_unique" UNIQUE("name"),
	CONSTRAINT "makes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "models_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"make_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"slug" varchar(64) NOT NULL,
	CONSTRAINT "models_make_id_slug_unique" UNIQUE("make_id","slug")
);
--> statement-breakpoint
CREATE TABLE "sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"whatsapp" varchar(32),
	"viber" varchar(32),
	"photo_url" text,
	"role" varchar(64),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" varchar(128) NOT NULL,
	"text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(128) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"role" "user_role" DEFAULT 'sales_manager' NOT NULL,
	"seller_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_feature_map" (
	"vehicle_id" uuid NOT NULL,
	"feature_id" integer NOT NULL,
	CONSTRAINT "vehicle_feature_map_vehicle_id_feature_id_pk" PRIMARY KEY("vehicle_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "vehicle_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"make_id" integer NOT NULL,
	"model_id" integer NOT NULL,
	"year" integer NOT NULL,
	"price" integer,
	"price_type" "price_type" DEFAULT 'fixed' NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"status" "vehicle_status" DEFAULT 'in_stock' NOT NULL,
	"mileage_km" integer,
	"fuel_type" "fuel_type" NOT NULL,
	"transmission" "transmission" NOT NULL,
	"drivetrain" "drivetrain",
	"body_type" "body_type",
	"power_hp" integer,
	"engine_cc" integer,
	"color" varchar(64),
	"origin_country" varchar(64) DEFAULT 'Switzerland' NOT NULL,
	"vin" varchar(17),
	"product_code" varchar(16) NOT NULL,
	"description" text,
	"estimated_delivery_days" integer,
	"views_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"assigned_seller_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "vehicles_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_seller_id_sellers_id_fk" FOREIGN KEY ("assigned_seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_feature_map" ADD CONSTRAINT "vehicle_feature_map_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_feature_map" ADD CONSTRAINT "vehicle_feature_map_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_photos" ADD CONSTRAINT "vehicle_photos_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_assigned_seller_id_sellers_id_fk" FOREIGN KEY ("assigned_seller_id") REFERENCES "public"."sellers"("id") ON DELETE set null ON UPDATE no action;