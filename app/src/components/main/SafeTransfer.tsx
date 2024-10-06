'use client';

import { useSolanaSafeProgram } from '../program/useSolanaSafeProgram';
import TransferSOLForm from './TransferSolForm';

export default function SafeTransfer() {
  const { isTransferring, safeTransferSOL } = useSolanaSafeProgram();

  return (
    <div>
      <TransferSOLForm onTransfer={safeTransferSOL} isLoading={isTransferring} />
    </div>
  );
}
