import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ProfilePage = () => {
  const userDetails = {
    name: "Student Name",
    email: "student@example.com",
    joinDate: "January 2024",
    completedTopics: 12,
    totalTopics: 20,
  };

  const recentActivity = [
    { topic: "Introduction to AI", score: 95, date: "2024-01-15" },
    { topic: "Machine Learning Basics", score: 88, date: "2024-01-20" },
    { topic: "Neural Networks", score: 92, date: "2024-01-25" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/api/placeholder/150/150" alt={userDetails.name} />
              <AvatarFallback>SN</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{userDetails.name}</CardTitle>
              <CardDescription className="text-gray-400">
                Member since {userDetails.joinDate}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your overall course completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={(userDetails.completedTopics / userDetails.totalTopics) * 100} 
                  className="h-2 bg-gray-700"
                />
                <p className="text-sm text-gray-400">
                  {userDetails.completedTopics} of {userDetails.totalTopics} topics completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="text-gray-400">Email:</span> {userDetails.email}</p>
                <p><span className="text-gray-400">Topics Completed:</span> {userDetails.completedTopics}</p>
                <p><span className="text-gray-400">Average Score:</span> 91.67%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead>Topic</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell>{activity.topic}</TableCell>
                    <TableCell>{activity.score}%</TableCell>
                    <TableCell>{activity.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;