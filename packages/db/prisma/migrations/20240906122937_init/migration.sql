-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trace" (
    "id" SERIAL NOT NULL,
    "txHash" TEXT NOT NULL,
    "result" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_agentId_key" ON "User"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "Trace_txHash_key" ON "Trace"("txHash");
