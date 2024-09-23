use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

mod errors;
use errors::TransferError::InvalidConfirmationCode;

declare_id!("Enj1cDwz8kDR95U2SayoDG7LXNdvxCKgNguV2gXHy2fV");

#[program]
pub mod solana_safe_transfer {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        msg!(
            "ca key: {:?}",
            ctx.accounts.confirmation_account.key().to_string(),
        );

        let key = ctx.accounts.confirmation_account.key().to_string();

        let confirmation_account = &mut ctx.accounts.confirmation_account;
        confirmation_account.code = key[..8].to_string();

        msg!("Confirmation Account initialized");
        msg!("Comfirmation Code: {:?}", confirmation_account.code);

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

        if confirmaction_code != confirmation_account.code {
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

    pub fn transfer_spl(
        ctx: Context<TransferSpl>,
        amount: u64,
        confirmaction_code: String,
    ) -> Result<()> {
        // Transfer SPL
        let confirmation_account = &ctx.accounts.confirmation_account;

        msg!("ca key: {:?}", confirmation_account.key().to_string(),);
        msg!("ca key: {:?}", ctx.accounts.from_token_account.amount);
        if confirmaction_code != confirmation_account.code {
            return Err(InvalidConfirmationCode.into());
        }
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                to: ctx.accounts.to_token_account.to_account_info(),
                from: ctx.accounts.from_token_account.to_account_info(),
                authority: ctx.accounts.from_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        );
        transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,

    #[account(init, payer = signer, space= ConfirmationAccount::INIT_SPACE, seeds = [signer.key().as_ref(), b"ca"], bump)]
    pub confirmation_account: Account<'info, ConfirmationAccount>,
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

#[derive(Accounts)]
pub struct TransferSpl<'info> {
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub mint: InterfaceAccount<'info, Mint>,

    // #[account(mut, associated_token::mint = mint, associated_token::authority = from_authority)]
    #[account(mut, token::mint = mint)]
    pub from_token_account: InterfaceAccount<'info, TokenAccount>,
    pub from_authority: Signer<'info>,

    // #[account(mut, associated_token::mint = mint, associated_token::authority = to_authority)]
    #[account(mut, token::mint = mint)]
    pub to_token_account: InterfaceAccount<'info, TokenAccount>,
    pub to_authority: SystemAccount<'info>,
    #[account(seeds = [to_authority.key().as_ref(), b"ca"], bump)]
    pub confirmation_account: Account<'info, ConfirmationAccount>,
}

#[account]
pub struct ConfirmationAccount {
    code: String,
}
impl Space for ConfirmationAccount {
    // anchor_discriminator + string_prefix + string
    const INIT_SPACE: usize = 8 + 4 + 10;
}
