const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const lines = [
'# =========================================================',
'# BLACK DRAGON AUTONOMOUS RUNNER TASK INSTALLER',
'# Registers Windows Scheduled Tasks for Long Beach runners',
'# =========================================================',
'',
'Set-Location "C:\\Dev\\Nexus_MASTER"',
'',
'$NodePath = "node"',
'$Root = "C:\\Dev\\Nexus_MASTER"',
'',
'$Tasks = @(',
'  @{',
'    Name = "Umbra_BlackDragon_Daily_Freshness_LongBeach"',
'    Script = "scripts\\clients\\black_dragon\\automation\\runners\\daily_freshness_runner.js"',
'    Schedule = "DAILY"',
'    Time = "06:00"',
'  },',
'  @{',
'    Name = "Umbra_BlackDragon_Weekly_Discovery_LongBeach"',
'    Script = "scripts\\clients\\black_dragon\\automation\\runners\\weekly_discovery_runner.js"',
'    Schedule = "WEEKLY"',
'    Day = "MONDAY"',
'    Time = "07:00"',
'  },',
'  @{',
'    Name = "Umbra_BlackDragon_Weekly_Revalidation_LongBeach"',
'    Script = "scripts\\clients\\black_dragon\\automation\\runners\\weekly_revalidation_runner.js"',
'    Schedule = "WEEKLY"',
'    Day = "MONDAY"',
'    Time = "07:30"',
'  },',
'  @{',
'    Name = "Umbra_BlackDragon_Weekly_DeltaFeed_LongBeach"',
'    Script = "scripts\\clients\\black_dragon\\automation\\runners\\weekly_delta_feed_runner.js"',
'    Schedule = "WEEKLY"',
'    Day = "MONDAY"',
'    Time = "08:00"',
'  },',
'  @{',
'    Name = "Umbra_BlackDragon_Monthly_Rerank_LongBeach"',
'    Script = "scripts\\clients\\black_dragon\\automation\\runners\\monthly_city_rerank_runner.js"',
'    Schedule = "MONTHLY"',
'    Time = "09:00"',
'  }',
')',
'',
'foreach ($Task in $Tasks) {',
'',
'  $Action = New-ScheduledTaskAction -Execute $NodePath -Argument $Task.Script -WorkingDirectory $Root',
'',
'  if ($Task.Schedule -eq "DAILY") {',
'    $Trigger = New-ScheduledTaskTrigger -Daily -At $Task.Time',
'  }',
'  elseif ($Task.Schedule -eq "WEEKLY") {',
'    $Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Task.Day -At $Task.Time',
'  }',
'  elseif ($Task.Schedule -eq "MONTHLY") {',
'    $Trigger = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At $Task.Time',
'  }',
'',
'  Register-ScheduledTask `',
'    -TaskName $Task.Name `',
'    -Action $Action `',
'    -Trigger $Trigger `',
'    -Description "Umbra Black Dragon autonomous Long Beach runner" `',
'    -Force',
'',
'  Write-Host "[REGISTERED] $($Task.Name)"',
'}',
'',
'Write-Host ""',
'Write-Host "Black Dragon scheduled task install script complete."'
];

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/scheduler/install_windows_scheduled_tasks.ps1"
);

fs.writeFileSync(
  out,
  lines.join("\\r\\n"),
  "utf8"
);

console.log(JSON.stringify({
  status: "SCHEDULER_INSTALL_SCRIPT_REPAIR_COMPLETE",
  output: out
}, null, 2));
