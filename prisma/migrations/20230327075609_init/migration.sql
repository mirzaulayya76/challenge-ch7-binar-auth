-- AlterTable
CREATE SEQUENCE playerbiodata_dateofbirth_seq;
ALTER TABLE "playerBiodata" ALTER COLUMN "dateOfBirth" SET DEFAULT nextval('playerbiodata_dateofbirth_seq');
ALTER SEQUENCE playerbiodata_dateofbirth_seq OWNED BY "playerBiodata"."dateOfBirth";
