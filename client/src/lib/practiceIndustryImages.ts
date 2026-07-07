import pCorporateMa from "@assets/santos_saucedo_branded/p-corporate-ma.png";
import pAntitrust from "@assets/santos_saucedo_branded/p-antitrust-competition.png";
import pArbitration from "@assets/santos_saucedo_branded/p-arbitration.png";
import pLitigation from "@assets/santos_saucedo_branded/p-litigation.png";
import pInvestigations from "@assets/santos_saucedo_branded/p-investigations-anticorruption.png";
import pBankruptcy from "@assets/santos_saucedo_branded/p-bankruptcy-restructuring.png";
import pBanking from "@assets/santos_saucedo_branded/p-banking-finance.png";
import pEnergy from "@assets/santos_saucedo_branded/p-energy-natural-resources.png";
import pEsg from "@assets/santos_saucedo_branded/p-esg.png";
import pRealEstate from "@assets/santos_saucedo_branded/p-real-estate.png";
import pIp from "@assets/santos_saucedo_branded/p-intellectual-property.png";
import pLabor from "@assets/santos_saucedo_branded/p-labor-employment.png";
import pTax from "@assets/santos_saucedo_branded/p-tax.png";
import pIntlTrade from "@assets/santos_saucedo_branded/p-international-trade.png";
import pTmt from "@assets/santos_saucedo_branded/p-telecommunications-media-technology.png";
import pEnvironmental from "@assets/santos_saucedo_branded/p-environmental.png";
import pAdministrative from "@assets/santos_saucedo_branded/p-administrative-law.png";
import pGermanDesk from "@assets/santos_saucedo_branded/p-german-desk.png";

import iAutomotive from "@assets/santos_saucedo_branded/i-automotive-mobility-manufacturing.png";
import iConsumer from "@assets/santos_saucedo_branded/i-consumer-goods.png";
import iEnergyInd from "@assets/santos_saucedo_branded/i-energy-natural-resources-industry.png";
import iPharma from "@assets/santos_saucedo_branded/i-pharmaceutical-life-sciences.png";
import iFinancial from "@assets/santos_saucedo_branded/i-financial-services.png";
import iRealEstateInd from "@assets/santos_saucedo_branded/i-real-estate-industry.png";
import iTech from "@assets/santos_saucedo_branded/i-technology-industry.png";

export const PRACTICE_IMAGES: Record<string, string> = {
  "corporate-ma": pCorporateMa,
  "antitrust-competition": pAntitrust,
  "arbitration": pArbitration,
  "litigation": pLitigation,
  "investigations-anticorruption": pInvestigations,
  "bankruptcy-restructuring": pBankruptcy,
  "banking-finance": pBanking,
  "energy-natural-resources": pEnergy,
  "esg": pEsg,
  "real-estate": pRealEstate,
  "intellectual-property": pIp,
  "labor-employment": pLabor,
  "tax": pTax,
  "international-trade": pIntlTrade,
  "telecommunications-media-technology": pTmt,
  "environmental": pEnvironmental,
  "administrative-law": pAdministrative,
  "german-desk": pGermanDesk,
};

export const INDUSTRY_IMAGES: Record<string, string> = {
  "automotive-mobility-manufacturing": iAutomotive,
  "consumer-goods": iConsumer,
  "energy-natural-resources-industry": iEnergyInd,
  "energy-natural-resources": iEnergyInd,
  "pharmaceutical-life-sciences": iPharma,
  "financial-services": iFinancial,
  "real-estate-industry": iRealEstateInd,
  "real-estate": iRealEstateInd,
  "technology-industry": iTech,
  "technology": iTech,
};

const FALLBACK_IMAGE = pCorporateMa;

export function getPracticeImage(slug: string, override?: string | null): string {
  if (override && override.trim().length > 0) return override;
  return PRACTICE_IMAGES[slug] || FALLBACK_IMAGE;
}

export function getIndustryImage(slug: string, override?: string | null): string {
  if (override && override.trim().length > 0) return override;
  return INDUSTRY_IMAGES[slug] || FALLBACK_IMAGE;
}
