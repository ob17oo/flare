import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mockKeyForBuildTime"

export const stripe = new Stripe(stripeSecretKey, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2026-05-27.dahlia" as any,
})
