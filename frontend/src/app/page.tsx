"use client"
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, FileText } from "lucide-react";


export default function Home() {
  const quickActions = [
    {
      title: 'Chat with assistant',
      description: "Chat with our AI assistant for personalized health insights.",
      href: '/chatbot',
      icon: <Upload className="h-5 w-5 text-white" />,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Report Summaries',
      description: 'AI-generated summaries of your medical reports.',
      href: '/reports',
      icon: <FileText className="h-5 w-5 text-white" />,
      bgColor: 'bg-purple-500',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 px-4 md:px-8 pb-12">
        {/* Welcome Section */}
        <Card className="shadow-xl border border-gray-100 bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Welcome to Aarobot Hub
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Your central place for managing and understanding your health records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get started by uploading your medical documents, viewing health trends, or exploring AI-summarized reports.
            </p>
          </CardContent>
        </Card>

        {/* Quick Action Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((card, index) => (
            <Card key={index} className="transition duration-300 hover:shadow-xl border border-gray-100 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold text-gray-800">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <Button size="sm" className="w-full" asChild>
                  <Link href={card.href}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
