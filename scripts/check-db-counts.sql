SELECT 'universities' as tbl, COUNT(*) as cnt FROM universities
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'campuses', COUNT(*) FROM campuses;
