package com.corehive.backend.repository;


import com.corehive.backend.model.SystemStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemStatRepository extends JpaRepository<SystemStat, Long> {

    // වැදගත්ම කොටස: Database එකේ තියෙන අන්තිම දත්ත 24 (Latest 24 records) ලබා ගැනීම
    List<SystemStat> findTop72ByOrderByIdDesc();
}
