"use client";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { GenerateChart } from "./generate-chart";
import { GenerateSummary } from "./generate-summary";
import { GenerateText } from "./generate-text";
import { AnimatePresence } from "motion/react";

export function SectionTwo() {
  const [selectedTab, setSelectedTab] = useState("tab1");

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="md:text-2xl font-bold tracking-wide text-lg">
          See what magic can be done with this
        </h2>
        <div className="flex items-center w-full">
            <AnimatePresence mode="wait">

        
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="border-none w-full "
          >
            <TabsList className="border-none bg-transparent gap-2 sm:gap-4">
              <TabsTrigger value="tab1" className="border-none shadow-none text-sm md:text-md">
               <span className="hidden sm:inline">

                Generate Charts
               </span>
               <span className="inline sm:hidden">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="tab2" className="border-none text-sm md:text-md p-0">
                  
                <span className="hidden sm:inline">
                Generate Summary
                </span>
                <span className="inline sm:hidden">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="tab3" className="border-none text-sm md:text-md p-0">
                <span className="hidden sm:inline">Generate Content</span>
                <span className="inline sm:hidden">Content</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tab1">
              <GenerateChart />
            </TabsContent>

            <TabsContent value="tab2">
              <GenerateSummary />
            </TabsContent>

            <TabsContent value="tab3">
              <GenerateText />
            </TabsContent>
          </Tabs>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
