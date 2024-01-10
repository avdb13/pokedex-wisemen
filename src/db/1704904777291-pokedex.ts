import { MigrationInterface, QueryRunner } from "typeorm";

export class Here1704904777291 implements MigrationInterface {
    name = 'Here1704904777291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pokemon" ("id" SERIAL NOT NULL, "base_experience" integer NOT NULL, "height" integer NOT NULL, "is_default" boolean NOT NULL, "location_area_encounters" character varying NOT NULL, "order" integer NOT NULL, "weight" integer NOT NULL, "formName" character varying NOT NULL, "formUrl" character varying NOT NULL, "speciesName" character varying NOT NULL, "speciesUrl" character varying NOT NULL, CONSTRAINT "PK_0b503db1369f46c43f8da0a6a0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "abilities" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "is_hidden" boolean NOT NULL, "slot" integer NOT NULL, "pokemonId" integer, CONSTRAINT "PK_8cd72b52f6374bf02333abf365a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25ee05f003dd1fb8f9198be68a" ON "abilities" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "game_indices" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "value" integer NOT NULL, "pokemonId" integer, CONSTRAINT "PK_2f073afb538d9bb98f9290f6370" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_001f80ec03a1bf4aeb951ed32e" ON "game_indices" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "version_details" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "rarity" integer NOT NULL, "itemId" integer, CONSTRAINT "PK_38b96102ed6d982a6a4c54b16c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4a1198c63c4288ab376c626d3c" ON "version_details" ("itemId") `);
        await queryRunner.query(`CREATE TABLE "held_items" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "pokemonId" integer, CONSTRAINT "PK_98f48e89d798c91af8b028809da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a4ddfad0117ee61d9973aed540" ON "held_items" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "version_group_details" ("id" SERIAL NOT NULL, "level_learned_at" integer NOT NULL, "moveId" integer, "moveLearnMethodName" character varying NOT NULL, "moveLearnMethodUrl" character varying NOT NULL, "versionGroupName" character varying NOT NULL, "versionGroupUrl" character varying NOT NULL, CONSTRAINT "PK_3ccf8a9c56cdcd72464c685b2e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_837076cfbdc980edbb971d9e91" ON "version_group_details" ("moveId") `);
        await queryRunner.query(`CREATE TABLE "moves" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "pokemonId" integer, CONSTRAINT "PK_fcbf4e07f988d7d37d00e933133" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cee68f8b5fdd521c96623a6b7b" ON "moves" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "sprites" ("front_default" character varying NOT NULL, "front_female" character varying, "front_shiny" character varying, "front_shiny_female" character varying, "back_default" character varying, "back_female" character varying, "back_shiny" character varying, "back_shiny_female" character varying, "id" SERIAL NOT NULL, "title" character varying, "is_other" boolean DEFAULT false, "is_animated" boolean DEFAULT false, "is_icons" boolean DEFAULT false, "pokemonId" integer, CONSTRAINT "PK_2c2a4a34b90a075e28caf878985" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ca65afdc12becf70b788101c0" ON "sprites" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "types" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "slot" integer NOT NULL, "pokemonId" integer, CONSTRAINT "PK_33b81de5358589c738907c3559b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_51ec4449323be8168e4e95a03f" ON "types" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "stats" ("name" character varying NOT NULL, "url" character varying NOT NULL, "id" SERIAL NOT NULL, "base_stat" integer NOT NULL, "effort" integer NOT NULL, "pokemonId" integer, CONSTRAINT "PK_c76e93dfef28ba9b6942f578ab1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8868cd7921b3a66c19c4e84a9e" ON "stats" ("pokemonId") `);
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "pokemons" integer array NOT NULL DEFAULT '{}', CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "abilities" ADD CONSTRAINT "FK_25ee05f003dd1fb8f9198be68aa" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_indices" ADD CONSTRAINT "FK_001f80ec03a1bf4aeb951ed32e9" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "version_details" ADD CONSTRAINT "FK_4a1198c63c4288ab376c626d3cc" FOREIGN KEY ("itemId") REFERENCES "held_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "held_items" ADD CONSTRAINT "FK_a4ddfad0117ee61d9973aed5405" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "version_group_details" ADD CONSTRAINT "FK_837076cfbdc980edbb971d9e918" FOREIGN KEY ("moveId") REFERENCES "moves"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "moves" ADD CONSTRAINT "FK_cee68f8b5fdd521c96623a6b7b5" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprites" ADD CONSTRAINT "FK_0ca65afdc12becf70b788101c03" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "types" ADD CONSTRAINT "FK_51ec4449323be8168e4e95a03ff" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stats" ADD CONSTRAINT "FK_8868cd7921b3a66c19c4e84a9e1" FOREIGN KEY ("pokemonId") REFERENCES "pokemon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "stats" DROP CONSTRAINT "FK_8868cd7921b3a66c19c4e84a9e1"`);
        await queryRunner.query(`ALTER TABLE "types" DROP CONSTRAINT "FK_51ec4449323be8168e4e95a03ff"`);
        await queryRunner.query(`ALTER TABLE "sprites" DROP CONSTRAINT "FK_0ca65afdc12becf70b788101c03"`);
        await queryRunner.query(`ALTER TABLE "moves" DROP CONSTRAINT "FK_cee68f8b5fdd521c96623a6b7b5"`);
        await queryRunner.query(`ALTER TABLE "version_group_details" DROP CONSTRAINT "FK_837076cfbdc980edbb971d9e918"`);
        await queryRunner.query(`ALTER TABLE "held_items" DROP CONSTRAINT "FK_a4ddfad0117ee61d9973aed5405"`);
        await queryRunner.query(`ALTER TABLE "version_details" DROP CONSTRAINT "FK_4a1198c63c4288ab376c626d3cc"`);
        await queryRunner.query(`ALTER TABLE "game_indices" DROP CONSTRAINT "FK_001f80ec03a1bf4aeb951ed32e9"`);
        await queryRunner.query(`ALTER TABLE "abilities" DROP CONSTRAINT "FK_25ee05f003dd1fb8f9198be68aa"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8868cd7921b3a66c19c4e84a9e"`);
        await queryRunner.query(`DROP TABLE "stats"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_51ec4449323be8168e4e95a03f"`);
        await queryRunner.query(`DROP TABLE "types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ca65afdc12becf70b788101c0"`);
        await queryRunner.query(`DROP TABLE "sprites"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee68f8b5fdd521c96623a6b7b"`);
        await queryRunner.query(`DROP TABLE "moves"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_837076cfbdc980edbb971d9e91"`);
        await queryRunner.query(`DROP TABLE "version_group_details"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4ddfad0117ee61d9973aed540"`);
        await queryRunner.query(`DROP TABLE "held_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a1198c63c4288ab376c626d3c"`);
        await queryRunner.query(`DROP TABLE "version_details"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_001f80ec03a1bf4aeb951ed32e"`);
        await queryRunner.query(`DROP TABLE "game_indices"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25ee05f003dd1fb8f9198be68a"`);
        await queryRunner.query(`DROP TABLE "abilities"`);
        await queryRunner.query(`DROP TABLE "pokemon"`);
    }

}
