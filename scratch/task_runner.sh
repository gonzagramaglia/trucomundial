# Check if type exists
grep -rn "is_approved" src/components/landing/tournaments/types.ts || sed -i '' 's/status:/is_approved?: boolean;\n  status:/g' src/components/landing/tournaments/types.ts
