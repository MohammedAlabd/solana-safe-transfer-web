use anchor_lang::prelude::*;

declare_id!("Enj1cDwz8kDR95U2SayoDG7LXNdvxCKgNguV2gXHy2fV");

#[program]
pub mod solana_safe_transfer {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
