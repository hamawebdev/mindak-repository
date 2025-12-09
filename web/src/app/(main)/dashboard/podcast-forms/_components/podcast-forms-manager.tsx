"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { QuestionsManager } from "./questions-manager";
import { StepsManager } from "./steps-manager";
import { PacksManager } from "./packs-manager";
import { SupplementsManager } from "./supplements-manager";
import { DecorsManager } from "./decors-manager";
// Import ThemeManager from the adjacent module to avoid duplication
import { ThemeManager } from "../../podcast-configuration/_components/theme-manager";

export function PodcastFormsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Podcast Form Management</h1>
        <p className="text-muted-foreground">
          Configure all aspects of the podcast reservation form and offerings.
        </p>
      </div>

      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="packs">Packs</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
          <TabsTrigger value="decors">Decors</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <StepsManager />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <QuestionsManager />
        </TabsContent>

        <TabsContent value="packs" className="space-y-4">
          <PacksManager />
        </TabsContent>

        <TabsContent value="supplements" className="space-y-4">
          <SupplementsManager />
        </TabsContent>

        <TabsContent value="decors" className="space-y-4">
          <DecorsManager />
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <ThemeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
