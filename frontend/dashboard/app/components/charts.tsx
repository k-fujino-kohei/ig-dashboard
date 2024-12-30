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
import dayjs, { OpUnitType } from "dayjs";
import minMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { Followers } from "~/features/api/followers";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "./ui/toggle-group"
import { useMemo, useState } from "react";

dayjs.extend(minMax);
dayjs.extend(utc);
dayjs.extend(tz)
dayjs.tz.setDefault('Asia/Tokyo')

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
  miniDate: string;
  active_count: number;
  new_follows_count: number;
};

/**
 * Followers配列からDailyFollowerCountsを生成する関数
 * @param followers - Followersの配列
 * @returns DailyFollowerCountsの配列
 */
function generateDailyFollowerCounts(followers: Followers[]): DailyFollowerCounts[] {
  if (followers.length === 0) return [];

  // created_atの最小日付と最大日付を取得
  let minDate = dayjs(followers[0].created_at);
  let maxDate = dayjs(followers[0].created_at);

  for (const follower of followers) {
    const created = dayjs(follower.created_at);
    const updated = dayjs(follower.updated_at);
    if (created.isBefore(minDate)) minDate = created;
    if (updated.isAfter(maxDate)) maxDate = updated;
  }

  const dailyCounts: DailyFollowerCounts[] = [];
  let currentDate = minDate.clone();

  while (currentDate.isSame(maxDate) || currentDate.isBefore(maxDate)) {
    const dateStr = currentDate.format('YYYY-MM-DD');

    // active_countの計算: created_at <= currentDate <= updated_at
    const active_count = followers.filter(follower => {
      const createdAt = dayjs(follower.created_at);
      const updatedAt = dayjs(follower.updated_at);
      const createdAtIsSameOrBefore = createdAt.isSame(currentDate, 'day') || createdAt.isBefore(currentDate, 'day');
      const updatedAtIsSameOrAfter = updatedAt.isSame(currentDate, 'day') || updatedAt.isAfter(currentDate, 'day');
      return createdAtIsSameOrBefore && updatedAtIsSameOrAfter;
    }).length;

    // new_follows_countの計算: created_atがcurrentDateと同じ
    const new_follows_count = followers.filter(follower =>
      dayjs(follower.created_at).isSame(currentDate, 'day')
    ).length;

    dailyCounts.push({
      date: dateStr,
      miniDate: currentDate.format('MM-DD'),
      active_count,
      new_follows_count,
    });

    // 次の日に進む
    currentDate = currentDate.add(1, 'day');
  }

  return dailyCounts;
}

export const Charts = ({ followers }: { followers: Followers[] }) => {
  const chartData = useMemo(() => generateDailyFollowerCounts(followers), [followers])
  const [span, setSpan] = useState("7");
  const [unit, setUnit] = useState("day");

  const filteredData = useMemo(() => {
    if (span === "all") return chartData;
    return chartData.filter((c) => dayjs(c.date, "YYYY-MM-DD").isAfter(dayjs().subtract(Number(span), "days")))
  }, [chartData, span])

  const aggregatedData = useMemo(() => {
    const unitType = unit as OpUnitType
    // 週ごとに集約する
    const agg = filteredData.reduce((acc, cur) => {
      const week = dayjs(cur.date).startOf(unitType).format("YYYY-MM-DD");
      const miniweek = dayjs(cur.date).startOf(unitType).format("MM-DD");
      if (!acc[week]) {
        acc[week] = { date: week, miniDate: miniweek, active_count: 0, new_follows_count: 0 };
      }
      // active_countはその週の最後に更新された値を使う
      // new_follows_countはその週の合計
      acc[week].active_count = cur.active_count;
      acc[week].new_follows_count += cur.new_follows_count;
      return acc;
    }, {} as Record<string, DailyFollowerCounts>);
    return Object.values(agg).map((v) => {
      if (unitType === "day") return v;
      const endweek = dayjs(v.date).endOf(unitType).format("DD");
      return {
        ...v,
        date: `${v.miniDate}~${endweek}`
      };
    });
  }, [filteredData, unit]);

  console.log(aggregatedData);

  return (
    <div className="h-full">
      <div className="p-3">
        <CardDescription className="flex items-center gap-2 text-xs">
          フォロワー数推移
          <TrendingUp size="16" />
          {/* 絞り込み */}
          <div className="border rounded-md border-muted text-xs">
            <ToggleGroup type="single" value={span} onValueChange={setSpan}>
              <ToggleGroupItem value="all" className="text-xs p-2 h-fit">
                全期間
              </ToggleGroupItem>
              <ToggleGroupItem value="30" className="text-xs p-2 h-fit">
                30日
              </ToggleGroupItem>
              <ToggleGroupItem value="7" className="text-xs p-2 h-fit">
                7日
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* 絞り込み */}
          <div className="border rounded-md border-muted">
            <ToggleGroup type="single" value={unit} onValueChange={setUnit}>
              <ToggleGroupItem value="week" className="text-xs p-2 h-fit">
                週
              </ToggleGroupItem>
              <ToggleGroupItem value="day" className="text-xs p-2 h-fit">
                日
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardDescription>
      </div>
      <ChartContainer config={chartConfig} className="h-[80%] w-full">
        <BarChart accessibilityLayer data={aggregatedData}
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
