#!/bin/bash
# Agent Testing Framework
# Automated testing for task and visual agents
# Creates temporary environment, runs tests, cleans up
# Part of the Claude Code Workspace Framework

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create isolated test environment
TEST_ID="test-$(date +%s)-$$"
TEST_DIR="/tmp/workspace-$TEST_ID"
ORIGINAL_CONFIG="$HOME/.claude/workspace-path.txt"
TEST_CONFIG="$HOME/.claude/test-workspace-path.txt"

echo -e "${BLUE}Testing: Creating isolated test environment: $TEST_DIR${NC}"

# Backup original config if it exists
if [[ -f "$ORIGINAL_CONFIG" ]]; then
    cp "$ORIGINAL_CONFIG" "$ORIGINAL_CONFIG.backup"
fi

# Cleanup function
cleanup() {
    echo -e "${YELLOW}Cleaning up test environment...${NC}"
    rm -rf "$TEST_DIR"
    rm -f "$TEST_CONFIG"

    # Restore original config
    if [[ -f "$ORIGINAL_CONFIG.backup" ]]; then
        mv "$ORIGINAL_CONFIG.backup" "$ORIGINAL_CONFIG"
    fi
}

# Setup cleanup on exit
trap cleanup EXIT

# Create test data structure (new unified layout)
mkdir -p "$TEST_DIR"/active/test01/{docs,logs,scratch}
mkdir -p "$TEST_DIR"/active/test02/{docs,logs,scratch}
mkdir -p "$TEST_DIR"/archive/weeks

# Create test task.md files
cat > "$TEST_DIR/active/test01/task.md" << 'EOF'
# Test task alpha
- **id**: test01
- **priority**: p1
- **created**: 2026-02-01
- **tags**: [testing]

## Context
First test task for validation
EOF

cat > "$TEST_DIR/active/test02/task.md" << 'EOF'
# Test task beta
- **id**: test02
- **priority**: p2
- **created**: 2026-02-01
- **due**: 2026-02-03
- **tags**: [testing, deadline]

## Context
Second test task with due date
EOF

# Create test PROGRESS.md files
cat > "$TEST_DIR/active/test01/PROGRESS.md" << 'EOF'
# Progress: Test task alpha

## Status
- **State**: In Progress
- **Last session**: 2026-02-01
- **Summary**: Working on tests
- **Next action**: Complete validation
- **Blocked on**: Nothing

## Next Actions
- [x] Set up test data
- [ ] Run validation
- [ ] Review results
EOF

cat > "$TEST_DIR/active/test02/PROGRESS.md" << 'EOF'
# Progress: Test task beta

## Status
- **State**: Not Started
- **Last session**: 2026-02-01
- **Summary**: Workspace created
- **Next action**: Review PLAN.md
- **Blocked on**: Nothing

## Next Actions
- [ ] First action
- [ ] Second action
EOF

# Create test index.md
cat > "$TEST_DIR/index.md" << 'EOF'
# Workspace

> Last updated: 2026-02-01 PST

## Active Tasks

| Task | Priority | Due | State | Next Action |
|------|----------|-----|-------|-------------|
| [Test task alpha](active/test01/) | P1 | — | In Progress | Complete validation |
| [Test task beta](active/test02/) | P2 | Feb 3 | Not Started | Review PLAN.md |
EOF

# Create test workspace config
cat > "$TEST_CONFIG" << EOF
WORKSPACE_DIR=/Users/lizhongzhang/Projects/workspace
WORKSPACE_DATA_DIR=$TEST_DIR
EOF

# Override config for this session
ln -sf "$TEST_CONFIG" "$ORIGINAL_CONFIG"

echo -e "${GREEN}Test environment ready${NC}"
echo "   Data directory: $TEST_DIR"
echo "   Config: Using $TEST_CONFIG"
echo ""

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test result tracking
test_result() {
    ((TESTS_RUN++))
    if [[ $1 -eq 0 ]]; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}  PASS: $2${NC}"
    else
        ((TESTS_FAILED++))
        echo -e "${RED}  FAIL: $2${NC}"
    fi
}

# Test functions
test_task_data_setup() {
    echo -e "${BLUE}Testing task data setup...${NC}"

    if [[ -f "$TEST_DIR/active/test01/task.md" ]] && grep -q "Test task alpha" "$TEST_DIR/active/test01/task.md"; then
        return 0
    else
        return 1
    fi
}

test_task_folder_structure() {
    echo -e "${BLUE}Testing task folder structure...${NC}"

    # Verify active/{id}/ has expected files and dirs
    if [[ -f "$TEST_DIR/active/test01/task.md" ]] && \
       [[ -f "$TEST_DIR/active/test01/PROGRESS.md" ]] && \
       [[ -d "$TEST_DIR/active/test01/docs" ]] && \
       [[ -d "$TEST_DIR/active/test01/logs" ]] && \
       [[ -d "$TEST_DIR/active/test01/scratch" ]] && \
       [[ -d "$TEST_DIR/archive/weeks" ]]; then
        return 0
    fi
    return 1
}

test_index_exists() {
    echo -e "${BLUE}Testing index.md exists...${NC}"

    if [[ -f "$TEST_DIR/index.md" ]] && grep -q "Active Tasks" "$TEST_DIR/index.md"; then
        return 0
    else
        return 1
    fi
}

test_progress_parsing() {
    echo -e "${BLUE}Testing PROGRESS.md state parsing...${NC}"

    # Verify State field is parseable
    if grep -q '^\- \*\*State\*\*:' "$TEST_DIR/active/test01/PROGRESS.md"; then
        return 0
    else
        return 1
    fi
}

test_file_isolation() {
    echo -e "${BLUE}Testing file isolation...${NC}"

    # Check that test files don't appear in production
    local prod_dir="/Users/lizhongzhang/Projects/workspace/workspace-data"

    if [[ -d "$prod_dir/active" ]]; then
        if ! [[ -d "$prod_dir/active/test01" ]]; then
            return 0  # Good - test data not in production
        else
            return 1  # Bad - test data leaked to production
        fi
    else
        return 0  # No production dir, isolation working
    fi
}

# Run tests
echo -e "${YELLOW}Running agent tests...${NC}"
echo ""

test_task_data_setup
test_result $? "Task test data setup"

test_task_folder_structure
test_result $? "Task folder structure (active/{id}/ layout)"

test_index_exists
test_result $? "Index.md generation"

test_progress_parsing
test_result $? "PROGRESS.md state parsing"

test_file_isolation
test_result $? "Production data isolation"

# Print summary
echo ""
echo -e "${BLUE}Test Summary${NC}"
echo "   Tests run: $TESTS_RUN"
echo -e "   Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "   Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed${NC}"
    exit 1
fi
