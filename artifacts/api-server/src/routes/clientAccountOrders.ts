import { Router } from "express";
import { transaction, requireClient, ClientAccessError, throttle } from "../lib/clientAccounts";
import { clientHandler } from "./clientAuth";
import { clientOriginGuard } from "../lib/clientAccountSecurity";
import { ownedLink, workspaceList, workspaceDetail } from "../lib/clientWorkspace";
import { sendConversation, decideArtwork } from "../lib/clientConversations";
import { GetClientAccountDashboardResponse, ListClientAccountOrdersResponse, GetClientAccountOrderResponse } from "@workspace/api-zod";

const router = Router();
router.use("/client-auth", clientOriginGuard);
function identifier(value: unknown) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ClientAccessError(404, "Published order not found");
  return id;
}

router.get("/client-auth/dashboard", clientHandler(async (req, res) => {
  const result = await transaction(async cx => {
    const { client } = await requireClient(cx, req);
    return (await workspaceList(cx, client.id)).dashboard;
  });
  res.json(GetClientAccountDashboardResponse.parse(result));
}));

router.get("/client-auth/orders", clientHandler(async (req, res) => {
  const data = await transaction(async cx => {
    const { client } = await requireClient(cx, req);
    return (await workspaceList(cx, client.id)).orders;
  });
  res.json(ListClientAccountOrdersResponse.parse({ data }));
}));

router.get("/client-auth/orders/:id", clientHandler(async (req, res) => {
  const id = identifier(req.params.id);
  const data = await transaction(async cx => {
    const { client } = await requireClient(cx, req);
    return workspaceDetail(cx, client.id, await ownedLink(cx, client.id, id));
  });
  res.json(GetClientAccountOrderResponse.parse({ data }));
}));

router.post("/client-auth/orders/:id/messages", clientHandler(async (req, res) => {
  const id = identifier(req.params.id);
  const data = await transaction(async cx => {
    const { client, account } = await requireClient(cx, req);
    await throttle(`conversation:account:${account.id}`, 60);
    return sendConversation(cx, await ownedLink(cx, client.id, id), req.body, "client");
  });
  res.status(201).json({ data });
}));

router.post("/client-auth/orders/:id/feedback", clientHandler(async (req, res) => {
  const id = identifier(req.params.id);
  const data = await transaction(async cx => {
    const { client, account } = await requireClient(cx, req);
    await throttle(`feedback:account:${account.id}`, 60);
    return decideArtwork(cx, await ownedLink(cx, client.id, id), req.body);
  });
  res.status(201).json({ data });
}));

export default router;
