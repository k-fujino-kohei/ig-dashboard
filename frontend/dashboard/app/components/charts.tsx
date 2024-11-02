import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Bar, BarChart
} from "recharts";

import { CardDescription } from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { Followers } from "~/features/api/followers";

dayjs.extend(minMax);

export const description = "A stacked area chart";

const chartConfig = {
  active_count: {
    label: "フォロワー数",
    color: "hsl(var(--chart-2))",
  },
  new_follows_count: {
    label: "新規フォロワー数",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type DailyFollowerCounts = {
  date: string;
  active_count: number;
  new_follows_count: number;
};

// 開始日から終了日までの日付配列を生成する関数
const generateDateArray = (followers: Followers[]): string[] => {
  // 開始日と終了日を設定
  const startDate = dayjs.min(followers.map((f) => dayjs(f.created_at)));
  const endDate = dayjs();
  const dates: string[] = [];
  if (!startDate) {
    return dates;
  }

  for (
    let date = startDate;
    date.isBefore(endDate) || date.isSame(endDate);
    date = date.add(1, "day")
  ) {
    dates.push(date.format("MM/DD"));
  }
  return dates;
};

// フォロー中の人数と新規フォロー数を日別に集計する関数
const countFollowersByDate = (
  followers: Followers[],
): DailyFollowerCounts[] => {
  // 開始日から終了日までの日付配列を生成
  const dateArray = generateDateArray(followers);

  // 日付ごとのフォロワー数を格納するオブジェクト
  const activeDateCount: { [date: string]: number } = {};
  const newFollowDateCount: { [date: string]: number } = {};

  // 各フォロワーについてフォロー期間の日付をカウント
  followers.forEach((follower) => {
    const followStart = dayjs(follower.created_at);
    const followEnd = dayjs(follower.updated_at);

    // 新規フォローの日付でカウント
    const formattedStartDate = followStart.format("MM/DD");
    newFollowDateCount[formattedStartDate] =
      (newFollowDateCount[formattedStartDate] || 0) + 1;

    // フォロー期間内の日付ごとにカウントをインクリメント
    for (
      let date = followStart;
      date.isBefore(followEnd) || date.isSame(followEnd);
      date = date.add(1, "day")
    ) {
      const formattedDate = date.format("MM/DD");
      activeDateCount[formattedDate] =
        (activeDateCount[formattedDate] || 0) + 1;
    }
  });

  // dateArrayを基に結果の配列を作成
  const dailyCounts: DailyFollowerCounts[] = dateArray.map((date) => ({
    date,
    active_count: activeDateCount[date] || 0,
    new_follows_count: newFollowDateCount[date] || 0,
  }));

  return dailyCounts;
};

export const Charts = ({ followers }: { followers: Followers[] }) => {
  const chartData = countFollowersByDate(followers);
  return (
    <div className="h-full">
      <div className="p-3">
        <CardDescription className="flex items-center gap-2 text-xs">
          フォロワー数推移
          <TrendingUp size="16" />
        </CardDescription>
      </div>
      <ChartContainer config={chartConfig} className="h-[80%] w-full">
        <BarChart accessibilityLayer data={chartData}
          margin={{ left: -23, right: 10, }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="new_follows_count"
            type="linear"
            fill="var(--color-active_count)"
            fillOpacity={0.8}
            stroke="var(--color-active_count)"
          >
            <LabelList
              position="top"
              offset={2}
              className="fill-neutral-800"
              fontSize={12}
            />
          </Bar>
          <Bar
            dataKey="active_count"
            type="linear"
            fill="var(--color-new_follows_count)"
            fillOpacity={0.8}
            stroke="var(--color-new_follows_count)"
          >
            <LabelList
              position="insideTop"
              offset={5}
              className="fill-neutral-800"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};
