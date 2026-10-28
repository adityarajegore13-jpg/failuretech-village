import VillageDetail from "@/components/village-detail";

const village = {
  name: "Kumbalangi",
  code: "LGD 627894",
  state: "Kerala",
  district: "Ernakulam",
  taluka: "Kochi",
  population: 12846,
  malePopulation: 6162,
  femalePopulation: 6684,
  literacyRate: 96.8,
  panchayat: "Kumbalangi Grama Panchayat",
  pinCode: "682007",
  constituency: "Kochi",
  updatedAt: "12 Jun 2024",
};

export default function Home() {
  return <VillageDetail village={village} />;
}
