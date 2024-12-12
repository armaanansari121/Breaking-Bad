-- CreateTable
CREATE TABLE "PreTx" (
    "id" SERIAL NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "predictedBlock" INTEGER NOT NULL,
    "traceId" INTEGER NOT NULL,

    CONSTRAINT "PreTx_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndReceiver" (
    "id" SERIAL NOT NULL,
    "balanceId" INTEGER NOT NULL,
    "traceId" INTEGER NOT NULL,

    CONSTRAINT "EndReceiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceInfo" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "balanceId" INTEGER NOT NULL,

    CONSTRAINT "BalanceInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PreTx" ADD CONSTRAINT "PreTx_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndReceiver" ADD CONSTRAINT "EndReceiver_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceInfo" ADD CONSTRAINT "BalanceInfo_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "EndReceiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
