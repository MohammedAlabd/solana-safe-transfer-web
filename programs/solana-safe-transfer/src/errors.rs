use anchor_lang::prelude::*;

#[error_code]
pub enum TransferError {
    #[msg("The confirmation code is invalid")]
    InvalidConfirmationCode,
}
