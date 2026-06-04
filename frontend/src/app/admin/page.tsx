"use client";

import { Header } from "@/components/header";
import { CreateMatchForm } from "@/components/admin/create-match-form";
import { UpdateScoreForm } from "@/components/admin/update-score-form";
import { AddCommentaryForm } from "@/components/admin/add-commentary-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage matches, update scores, and add live commentary
            </p>
          </div>

          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Match</TabsTrigger>
              <TabsTrigger value="score">Update Score</TabsTrigger>
              <TabsTrigger value="commentary">Add Commentary</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Match</CardTitle>
                  <CardDescription>
                    Create a new match. It will appear in real-time on the home
                    page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateMatchForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="score">
              <Card>
                <CardHeader>
                  <CardTitle>Update Match Score</CardTitle>
                  <CardDescription>
                    Update scores for an existing match. Changes appear
                    instantly via WebSocket.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UpdateScoreForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commentary">
              <Card>
                <CardHeader>
                  <CardTitle>Add Live Commentary</CardTitle>
                  <CardDescription>
                    Add commentary for a match. Updates appear in real-time on
                    the match detail page.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddCommentaryForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
