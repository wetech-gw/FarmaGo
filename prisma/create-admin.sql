-- Cria/repõe a conta admin@farmago.com (password: farmago123).
-- Hash scrypt compatível com lib/auth.ts (N=16384, r=8, p=1, keylen=64).
-- Idempotente: pode ser executado mais do que uma vez.

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `created_at`)
VALUES (
  'Administrador',
  'admin@farmago.com',
  'scrypt:b516d5e7921fac04bbe1f2e4984b0af6:416ce1685cbd7904ee40873803240ef998072904ca3cb0314d055397a0d0d177b86d9480251c7ce0ecbba628a85cfdd8e5fbd4ffb07dba5f7bc91c63b006ac1e',
  'admin',
  NOW()
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `role` = 'admin';

DELETE s FROM `sessions` s
JOIN `users` u ON u.`id` = s.`user_id`
WHERE u.`email` = 'admin@farmago.com';

SELECT `id`, `name`, `email`, `role`, `created_at`
FROM `users`
WHERE `email` = 'admin@farmago.com';
