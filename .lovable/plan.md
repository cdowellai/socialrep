

## Update Stripe Price IDs in Plans Table

The `plans` table currently has **product IDs** stored where **price IDs** should be. We need to update all 6 price ID fields across the 3 plans.

### Changes

Update the `plans` table with the correct Stripe price IDs:

| Plan | Monthly Price ID | Annual Price ID |
|------|-----------------|-----------------|
| Starter | `price_1SxuQfJk32EBuqy74vbExnqT` | `price_1SxuRBJk32EBuqy7VPNgRQ7H` |
| Professional | `price_1SxuRaJk32EBuqy729rRoJVb` | `price_1SxuRvJk32EBuqy74djz2vtc` |
| Agency | `price_1SxuSBJk32EBuqy7V8RjSJeb` | `price_1SxuSbJk32EBuqy7X9rQaMTI` |

### Technical Details

Three `UPDATE` statements against the `plans` table, matching on the `name` column:

```sql
UPDATE plans SET stripe_monthly_price_id = 'price_1SxuQfJk32EBuqy74vbExnqT', stripe_annual_price_id = 'price_1SxuRBJk32EBuqy7VPNgRQ7H' WHERE name = 'starter';
UPDATE plans SET stripe_monthly_price_id = 'price_1SxuRaJk32EBuqy729rRoJVb', stripe_annual_price_id = 'price_1SxuRvJk32EBuqy74djz2vtc' WHERE name = 'professional';
UPDATE plans SET stripe_monthly_price_id = 'price_1SxuSBJk32EBuqy7V8RjSJeb', stripe_annual_price_id = 'price_1SxuSbJk32EBuqy7X9rQaMTI' WHERE name = 'agency';
```

No code changes are needed — only database data updates.

