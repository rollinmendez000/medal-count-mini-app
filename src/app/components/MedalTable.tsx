"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface MedalData {
  code: string;
  total: number;
  gold: number;
  silver: number;
  bronze: number;
}
type SortKey = "total" | "gold" | "silver" | "bronze";

export default function MedalTable() {
  const [data, setData] = useState<MedalData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sortParam = searchParams?.get("sort");
  const sortKey: SortKey = ["total", "gold", "silver", "bronze"].includes(
    sortParam!
  )
    ? (sortParam as SortKey)
    : "gold";

  useEffect(() => {
    const fetchData = async () => {
      fetch("api/medals")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetcg data");

          return response.json();
        })
        .then((medals: MedalData[]) => {
          // Compute total 
          const medalsWithTotal = medals.map((medal) => ({
            ...medal,
            total: medal.gold + medal.silver + medal.bronze,
          })); 
          setData(medalsWithTotal);
        })
        .catch((err) => setError(err.message))
        .finally(() => {
            setIsLoading(false);
        });
    };

    fetchData();
  }, []);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", column);
    router.push(`${pathname}?${params.toString()}`); // Update the URL
  };

  const sortedMedals = [...data]
    .map((medal) => ({
      ...medal,
      total: medal.gold + medal.silver + medal.bronze, // Calculate total medals
    }))
    .sort((a, b) => {
      return (
        b[sortKey] - a[sortKey] || // Sort by selected key
        b.gold - a.gold || // If keys are the same, sort by gold
        b.silver - a.silver || // If gold is also the same, sort by silver
        b.bronze - a.bronze // If both are the same, sort by bronze
      );
    }).slice(0, 10);


  if(isLoading) {
    return (<p>Loading...</p>)
  } 

  if(error) {
    return (<p>Something went wrong. Please try again later!</p>)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3"></th>
              <th className="p-3"></th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 transition"
                onClick={() => handleSort("gold")}
              >
                <span className="block w-5 h-5 bg-yellow-500 rounded-full mx-auto"></span>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 transition"
                onClick={() => handleSort("silver")}
              >
                <span className="block w-5 h-5 bg-gray-400 rounded-full mx-auto"></span>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 transition"
                onClick={() => handleSort("bronze")}
              >
                <span className="block w-5 h-5 	bg-[#8B4513] rounded-full mx-auto"></span>
              </th>
              <th
                className="p-3 cursor-pointer hover:text-blue-600 transition"
                onClick={() => handleSort("total")}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMedals.map((medal, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition`}
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3"><span className={`icon ${medal.code.toLowerCase()} mr-1`}/> {medal.code}</td>
                <td className="p-3">{medal.gold}</td>
                <td className="p-3">{medal.silver}</td>
                <td className="p-3">{medal.bronze}</td>
                <td className="p-3 font-bold">{medal.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
