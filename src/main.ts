import "./style.css";
import { Forma } from "forma-embedded-view-sdk/auto";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Proposal Test</h1>
    <div class="card">
      <button id="updateProposalButton" type="button">Update Current Proposal</button>
      <button id="createProposalButton" type="button">Create New Proposal</button>
      <button id="listProposalsButton" type="button">List Proposals</button>
    </div>
  </div>
`;

function getTimestampFromUrn(urn: string): string | undefined {
  return urn.split(":").at(-1);
}

const updateProposalButton = document.querySelector<HTMLButtonElement>(
  "#updateProposalButton",
)!;
updateProposalButton.addEventListener("click", async () => {
  const proposalId = await Forma.proposal.getId();
  console.log(`Current Proposal ID: ${proposalId}`);

  const data = await Forma.proposal.get({ proposalId });
  const terrain = data.children?.find((child) => child.urn.includes("terrain"));
  if (!terrain) {
    console.error("Terrain not found");
    return;
  }

  const baseKey = Object.keys(data.properties?.flags ?? {})
    .filter(
      (key) => (data.properties?.flags?.[key] as { base?: boolean })?.base,
    )
    .at(0);
  if (!baseKey) {
    console.error("Base key not found in proposal properties");
    return;
  }

  const base = data.children?.find((child) => child.key === baseKey);
  if (!base) {
    console.error("Base not found");
    return;
  }

  const children = (data.children ?? []).filter(
    (child) => child.key !== baseKey && child.key !== terrain.key,
  );

  const revision = getTimestampFromUrn(data.urn);
  if (!revision) {
    console.error("Revision not found in proposal URN");
    return;
  }

  await Forma.proposal.update({
    proposalId,
    revision,
    proposal: {
      name: `${data.properties?.name ?? "MISSING NAME"} - Updated at ${new Date().toISOString()}`,
      terrain,
      base,
      children,
    },
  });
});

const createProposalButton = document.querySelector<HTMLButtonElement>(
  "#createProposalButton",
)!;
createProposalButton.addEventListener("click", async () => {
  const proposalId = await Forma.proposal.getId();
  console.log(`Current Proposal ID: ${proposalId}`);

  const data = await Forma.proposal.get({ proposalId });
  const terrain = data.children?.find((child) => child.urn.includes("terrain"));
  if (!terrain) {
    console.error("Terrain not found");
    return;
  }

  const baseKey = Object.keys(data.properties?.flags ?? {})
    .filter(
      (key) => (data.properties?.flags?.[key] as { base?: boolean })?.base,
    )
    .at(0);
  if (!baseKey) {
    console.error("Base key not found in proposal properties");
    return;
  }

  const base = data.children?.find((child) => child.key === baseKey);
  if (!base) {
    console.error("Base not found");
    return;
  }

  const children = (data.children ?? []).filter(
    (child) => child.key !== baseKey && child.key !== terrain.key,
  );

  const newProposalId = await Forma.proposal.create({
    name: `New Proposal at ${new Date().toISOString()}`,
    terrain,
    base,
    children,
  });
  console.log(`New Proposal ID: ${newProposalId}`);
});

const listProposalsButton = document.querySelector<HTMLButtonElement>(
  "#listProposalsButton",
)!;
listProposalsButton.addEventListener("click", async () => {
  const proposals = await Forma.proposal.getAll();
  console.log(`Proposals: ${JSON.stringify(proposals)}`);
});
