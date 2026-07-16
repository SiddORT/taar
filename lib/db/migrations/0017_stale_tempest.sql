CREATE TABLE "entity_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"entity_id" integer NOT NULL,
	"tag" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_tags_entity_type_entity_id_tag_unique" UNIQUE("entity_type","entity_id","tag")
);
