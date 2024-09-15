use anchor_lang::{prelude::*, solana_program::sysvar};

mod errors;
use errors::TransferError::InvalidConfirmationCode;

declare_id!("Enj1cDwz8kDR95U2SayoDG7LXNdvxCKgNguV2gXHy2fV");

#[program]
pub mod solana_safe_transfer {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);

        let confirmation_account = &mut ctx.accounts.confirmation_account;
        confirmation_account.confirmation_code = "Hello".to_string();

        msg!("Confirmation Account initialized");
        msg!(
            "Comfirmation Code: {:?}",
            confirmation_account.confirmation_code
        );

        Ok(())
    }

    pub fn transfer_sol(
        ctx: Context<TransferSol>,
        amount: u64,
        confirmaction_code: String,
    ) -> Result<()> {
        // Transfer SOL
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.from.key(),
            &ctx.accounts.to.key(),
            amount,
        );

        let confirmation_account = &ctx.accounts.confirmation_account;

        if confirmaction_code != confirmation_account.confirmation_code {
            return Err(InvalidConfirmationCode.into());
        }

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.to_account_info(),
            ],
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,

    #[account(init, payer = signer, space= ConfirmationAccount::INIT_SPACE, seeds = [signer.key().as_ref(), b"ca"], bump)]
    pub confirmation_account: Account<'info, ConfirmationAccount>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::slot_hashes::id())]
    recent_slothashes: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub to: SystemAccount<'info>,
    pub system_program: Program<'info, System>,

    #[account(seeds = [to.key().as_ref(), b"ca"], bump)]
    pub confirmation_account: Account<'info, ConfirmationAccount>,
}

#[account]
pub struct ConfirmationAccount {
    confirmation_code: String,
}
impl Space for ConfirmationAccount {
    // anchor_discriminator + string_prefix + string
    const INIT_SPACE: usize = 8 + 4 + 10;
}
