import {
  AnonCredsModule,
  LegacyIndyCredentialFormatService,
  LegacyIndyProofFormatService,
  V1CredentialProtocol,
  V1ProofProtocol,
  AnonCredsCredentialFormatService,
  AnonCredsProofFormatService,
} from '@aries-framework/anoncreds'
import { AnonCredsRsModule } from '@aries-framework/anoncreds-rs'
import { AskarModule } from '@aries-framework/askar'
import {
  Agent,
  AutoAcceptCredential,
  ConnectionsModule,
  CredentialsModule,
  DidsModule,
  MediatorPickupStrategy,
  ProofsModule,
  RecipientModule,
  V2CredentialProtocol,
  V2ProofProtocol,
} from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { anoncreds } from '@hyperledger/anoncreds-react-native'
import { ariesAskar } from '@hyperledger/aries-askar-react-native'
import { CheqdAnonCredsRegistry, CheqdModule, CheqdModuleConfig, CheqdDidRegistrar, CheqdDidResolver } from '@aries-framework/cheqd'

interface GetAgentModulesOptions {
  mediatorInvitationUrl?: string
}

export type BifoldAgent = Agent<ReturnType<typeof getAgentModules>>
export function getAgentModules({ mediatorInvitationUrl }: GetAgentModulesOptions) {
  const indyCredentialFormat = new LegacyIndyCredentialFormatService()
  const indyProofFormat = new LegacyIndyProofFormatService()

  return {
    askar: new AskarModule({
      ariesAskar,
    }),
    anoncredsRs: new AnonCredsRsModule({
      anoncreds,
    }),
    anoncreds: new AnonCredsModule({
      registries: [new CheqdAnonCredsRegistry()],
    }),
    dids: new DidsModule({
        registrars: [new CheqdDidRegistrar()],
        resolvers: [new CheqdDidResolver()],
      }),
    cheqdSdk: new CheqdModule(new CheqdModuleConfig({
        networks: [
          {
            network: 'testnet',
            cosmosPayerSeed: 'sketch mountain erode window enact net enrich smoke claim kangaroo another visual write meat latin bacon pulp similar forum guilt father state erase bright',
          },
        ],
      })),
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      credentialProtocols: [
        new V1CredentialProtocol({ indyCredentialFormat }),
        new V2CredentialProtocol({
          credentialFormats: [indyCredentialFormat, new AnonCredsCredentialFormatService()],
        }),
      ],
    }),
    proofs: new ProofsModule({
      proofProtocols: [
        new V1ProofProtocol({ indyProofFormat }),
        new V2ProofProtocol({
          proofFormats: [indyProofFormat, new AnonCredsProofFormatService()],
        }),
      ],
    }),
    mediationRecipient: new RecipientModule({
      mediatorInvitationUrl: mediatorInvitationUrl,
      mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
    }),
  }
}

interface MyAgentContextInterface {
  loading: boolean
  agent?: BifoldAgent
  setAgent: (agent?: BifoldAgent) => void
}

export const useAppAgent = useAgent as () => MyAgentContextInterface
