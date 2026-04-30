import { EcosystemSim } from './ecosystem/EcosystemSim'
import { RealEcosystemSim } from './ecosystem/RealEcosystemSim'
import { GeneticsSim } from './genetics/GeneticsSim'
import { TraitsGeneticsSim } from './genetics/TraitsGeneticsSim'
import { VirtualMicroscopeSim } from './microscope/VirtualMicroscopeSim'
import { DnaSim } from './dna/DnaSim'
import { ChallengesSim } from './challenges/ChallengesSim'

export const labSimRegistry = [ChallengesSim, TraitsGeneticsSim, GeneticsSim, DnaSim, VirtualMicroscopeSim, RealEcosystemSim, EcosystemSim] as const

