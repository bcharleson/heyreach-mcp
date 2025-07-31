# Backup & Recovery Guide 🔄

## 📦 **Complete Dual-Transport Backup Created**

Your complete dual-transport implementation has been safely preserved with multiple recovery options.

## 🏷️ **Backup Locations**

### **Git Branch:** `backup/dual-transport-v2.0.6`
```bash
# Switch to backup branch
git checkout backup/dual-transport-v2.0.6

# Verify you have the complete implementation
ls src/stdio-*  # Should show stdio-server.ts, stdio-index.ts
```

### **Git Tag:** `v2.0.6-dual-transport`
```bash
# Checkout specific tagged version
git checkout v2.0.6-dual-transport

# Or create new branch from tag
git checkout -b restore-dual-transport v2.0.6-dual-transport
```

### **GitHub Remote:**
- **Branch:** https://github.com/bcharleson/heyreach-mcp/tree/backup/dual-transport-v2.0.6
- **Tag:** https://github.com/bcharleson/heyreach-mcp/releases/tag/v2.0.6-dual-transport

## 🔄 **Recovery Scenarios**

### **Scenario 1: Restore Complete Dual-Transport**
```bash
# Create new branch from backup
git checkout -b restore-stdio-transport backup/dual-transport-v2.0.6

# Merge back to main if needed
git checkout main
git merge restore-stdio-transport
```

### **Scenario 2: Extract STDIO Files Only**
```bash
# Checkout specific files from backup branch
git checkout backup/dual-transport-v2.0.6 -- src/stdio-server.ts
git checkout backup/dual-transport-v2.0.6 -- src/stdio-index.ts
git checkout backup/dual-transport-v2.0.6 -- src/heyreach-client-simple.ts
git checkout backup/dual-transport-v2.0.6 -- src/simple-http-client.ts
```

### **Scenario 3: Compare Implementations**
```bash
# View differences between HTTP-only and dual-transport
git diff main backup/dual-transport-v2.0.6 -- src/
```

## 📋 **What's Preserved in Backup**

### **✅ STDIO Transport Implementation:**
- `src/stdio-server.ts` - Complete STDIO server with MCP integration
- `src/stdio-index.ts` - Entry point with CLI argument parsing
- `src/heyreach-client-simple.ts` - Optimized HTTP client for STDIO
- `src/simple-http-client.ts` - Lightweight HTTP implementation

### **✅ HTTP Transport Implementation:**
- `src/http-server.ts` - Production HTTP streaming server
- `src/http-index.ts` - HTTP server entry point
- Enhanced session management and authentication

### **✅ Configuration Examples:**
- `claude-desktop-config.json` - All transport configurations
- README examples for both transports
- n8n integration guides

### **✅ Investigation & Documentation:**
- `STDIO_TRANSPORT_SOLUTION.md` - Complete issue analysis
- `HTTP_ONLY_ARCHITECTURE_PROPOSAL.md` - Migration strategy
- All debugging scripts and test files
- MCP SDK version compatibility testing

### **✅ Build & Package Configuration:**
- `package.json` with dual-transport scripts
- `tsconfig.json` configurations
- All dependencies and devDependencies

## 🚨 **Emergency Recovery**

If you need to immediately restore the dual-transport implementation:

```bash
# Emergency restore - creates new branch with full backup
git fetch origin
git checkout -b emergency-restore backup/dual-transport-v2.0.6
npm install
npm run build

# Test STDIO transport
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/stdio-index.js --api-key=YOUR_KEY

# Test HTTP transport  
npm run start:http
```

## 📊 **Backup Verification**

### **Commit Information:**
- **Commit Hash:** `7775ea5`
- **Files Changed:** 44 files, 6,007 insertions
- **Branch:** `backup/dual-transport-v2.0.6`
- **Tag:** `v2.0.6-dual-transport`

### **Verification Commands:**
```bash
# Verify backup branch exists
git branch -a | grep backup/dual-transport

# Verify tag exists
git tag | grep dual-transport

# Verify remote backup
git ls-remote origin | grep backup/dual-transport
```

## 🔍 **Key Differences Analysis**

When you need to understand what changed:

```bash
# Compare current main vs backup
git diff main backup/dual-transport-v2.0.6

# See what files were removed in HTTP-only
git diff --name-status main backup/dual-transport-v2.0.6

# Show backup branch commit history
git log backup/dual-transport-v2.0.6 --oneline -10
```

## 🎯 **Recovery Decision Matrix**

| Scenario | Recovery Method | Time | Risk |
|----------|-----------------|------|------|
| Need STDIO back temporarily | Checkout backup branch | 2 min | Low |
| Permanent STDIO restoration | Merge backup to main | 10 min | Medium |
| Extract specific STDIO files | Cherry-pick files | 5 min | Low |
| Compare implementations | Git diff analysis | 2 min | None |
| Emergency full restore | Clone from GitHub tag | 5 min | Low |

## 🛡️ **Backup Safety**

Your backup is **triple-protected**:
1. **Local Git Branch** - Immediate access
2. **Local Git Tag** - Version reference
3. **GitHub Remote** - Cloud backup

**Recovery confidence: 100%** ✅

---

*This backup was created before implementing HTTP-only architecture. All STDIO transport functionality and investigation work is preserved and can be restored at any time.*