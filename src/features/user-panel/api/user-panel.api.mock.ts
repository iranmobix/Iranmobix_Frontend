import { panelFavoritesMock } from "../mock/panel-favorites.mock";
import type { PanelFavoriteApi } from "../types/panel-favorite.types";
import { panelCommentsMock } from "../mock/panel-comments.mock";
import type { PanelCommentApi } from "../types/panel-comment.types";
import { userPanelMock } from "../mock/user-panel.mock";
import type { UserPanelAccountApi } from "../types/user-panel-api.types";

import { panelOrdersMock } from "../mock/panel-orders.mock";
import type { PanelOrderApi } from "../types/panel-order.types";

import { panelPaymentsMock } from "../mock/panel-payments.mock";
import type { PanelPaymentApi } from "../types/panel-payment.types";

import { panelWalletMock } from "../mock/panel-wallet.mock";
import type { PanelWalletApi } from "../types/panel-wallet.types";

import { panelTicketsMock } from "../mock/panel-tickets.mock";
import type {
  PanelTicketApi,
  PanelTicketInput,
  PanelTicketMessageApi,
  PanelTicketReplyInput,
} from "../types/panel-ticket.types";
let nextTicketCode = 145461;
const mobileChallenges = new Map<
  string,
  { mobile: string; expiresAt: number }
>();

export const userPanelMockApi = {
  async requestMobileChange(mobile: string) {
    for (const [id, challenge] of mobileChallenges)
      if (challenge.expiresAt <= Date.now()) mobileChallenges.delete(id);
    const challengeId = crypto.randomUUID();
    mobileChallenges.set(challengeId, {
      mobile,
      expiresAt: Date.now() + 120000,
    });
    return { challengeId };
  },
  async verifyMobileChange(challengeId: string, code: string) {
    const challenge = mobileChallenges.get(challengeId);
    if (!challenge || challenge.expiresAt <= Date.now()) {
      mobileChallenges.delete(challengeId);
      throw new Error("کد منقضی شده است؛ شماره را دوباره وارد کنید.");
    }
    if (code !== "123456") throw new Error("کد تأیید صحیح نیست.");
    mobileChallenges.delete(challengeId);
    return challenge.mobile;
  },
  async getFavorites(): Promise<PanelFavoriteApi[]> {
    return structuredClone(panelFavoritesMock);
  },
  async getComments(): Promise<PanelCommentApi[]> {
    return structuredClone(panelCommentsMock);
  },
  async getTickets(): Promise<PanelTicketApi[]> {
    return structuredClone(panelTicketsMock);
  },
  async createTicket(input: PanelTicketInput): Promise<PanelTicketApi> {
    return {
      id: crypto.randomUUID(),
      code: String(nextTicketCode++),
      title: input.title,
      message: input.message,
      created_at: new Date().toISOString(),
      status: "processing",
      messages: [
        await this.replyToTicket({ message: input.message, file: input.file }),
      ],
      attachment: input.file
        ? {
            name: input.file.name,
            size: input.file.size,
            type: input.file.type,
          }
        : null,
    };
  },
  async replyToTicket(
    input: Pick<PanelTicketReplyInput, "message" | "file">,
  ): Promise<PanelTicketMessageApi> {
    return {
      id: crypto.randomUUID(),
      author: "customer",
      author_name: userPanelMock.first_name + " " + userPanelMock.last_name,
      body: input.message,
      sent_at: new Date().toISOString(),
      attachment: input.file
        ? {
            name: input.file.name,
            size: input.file.size,
            type: input.file.type,
          }
        : null,
    };
  },
  async getWallet(): Promise<PanelWalletApi> {
    return structuredClone(panelWalletMock);
  },
  async getPayments(): Promise<PanelPaymentApi[]> {
    return structuredClone(panelPaymentsMock);
  },
  async getOrders(): Promise<PanelOrderApi[]> {
    return structuredClone(panelOrdersMock);
  },
  async getAccount(): Promise<UserPanelAccountApi> {
    return structuredClone(userPanelMock);
  },
};
