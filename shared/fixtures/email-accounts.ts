import type { EmailAccount } from "@/shared/types/email";

export const emailAccounts: EmailAccount[] = [
  {
    id: "acc-1",
    email: "nguyen.van.a@preciofishbone.com",
    provider: "gmail",
    status: "connected",
    connectedAt: "2025-02-10T08:30:00Z",
  },
  {
    id: "acc-2",
    email: "tran.thi.b@preciofishbone.com",
    provider: "outlook",
    status: "expired",
    connectedAt: "2024-11-20T14:00:00Z",
  },
  {
    id: "acc-3",
    email: "le.van.c@preciofishbone.com",
    provider: "gmail",
    status: "not_connected",
  },
];
