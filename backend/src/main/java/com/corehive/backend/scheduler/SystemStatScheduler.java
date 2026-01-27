package com.corehive.backend.scheduler;

import com.corehive.backend.model.SystemStat;
import com.corehive.backend.repository.SystemStatRepository;
import com.sun.management.OperatingSystemMXBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.lang.management.ManagementFactory;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Component
public class SystemStatScheduler {

    @Autowired
    private SystemStatRepository repository;

    // මෙම Method එක සෑම තත්පර 10කට වරක් ස්වයංක්‍රීයව වැඩ කරයි.
    // පැය 24ක graph එකක් සඳහා ඔබට මෙය විනාඩි 15කට වරක් (900000ms) ලෙස වෙනස් කළ හැකියි.
    @Scheduled(fixedRate = 60000)
    public void captureSystemMetrics() {

        // 1. Operating System එකේ තොරතුරු ගන්නා Bean එකක් සාදා ගැනීම
        OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();

        // 2. CPU භාවිතය ලබා ගැනීම (මෙය 0.0 සිට 1.0 දක්වා අගයක් දෙයි, එය 100න් වැඩි කළ යුතුය)
        double cpuLoad = osBean.getCpuLoad() * 100;

        // 3. Memory (RAM) භාවිතය ලබා ගැනීම
        double totalMemory = osBean.getTotalPhysicalMemorySize();
        double freeMemory = osBean.getFreePhysicalMemorySize();
        double usedMemoryPercentage = ((totalMemory - freeMemory) / totalMemory) * 100;

        // 4. දත්ත Database එකට Save කිරීම (Step 2 එකේ හැදූ Entity එක)
        SystemStat stat = new SystemStat();
        stat.setCpu(Math.round(cpuLoad));
        stat.setMemory(Math.round(usedMemoryPercentage));
        stat.setTime(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));

        repository.save(stat);

        System.out.println("Stats saved: CPU " + stat.getCpu() + "%, RAM " + stat.getMemory() + "%");
    }
}