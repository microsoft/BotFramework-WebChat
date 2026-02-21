export PATH := $(realpath ../../../node_modules/.bin):$(PATH)

# entry points
ZOD_SRC := ./entry/zod.js
MCP_SRC := ./entry/mcp.js
MCP_EXT_APP_SRC := ./entry/mcp-ext-app.js

# build targets
ZOD_OUT := out/zod.js
MCP_OUT := out/mcp.js
MCP_EXT_APP_OUT := out/mcp-ext-app.js

# build options
SHARED_FLAGS := --sourcemap --format=esm --bundle --platform=browser

# aliases
ALIAS_MCP := --alias:@modelcontextprotocol/sdk/types.js=./mcp.js --external:./mcp.js
ALIAS_ZOD := --alias:zod/v4=./zod.js --alias:zod/v4-mini=./zod.js --alias:zod/v3=./zod.js --alias:zod=./zod.js --external:./zod.js

# build rules
$(ZOD_OUT): $(ZOD_SRC)
	@mkdir -p out
	esbuild $(ZOD_SRC) --outfile=$@ \
		$(SHARED_FLAGS)

$(MCP_OUT): $(MCP_SRC)
	@mkdir -p out
	esbuild $(MCP_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(MCP_FLAGS) \
		$(ALIAS_ZOD)

$(MCP_EXT_APP_OUT): $(MCP_OUT) $(ZOD_OUT)
$(MCP_EXT_APP_OUT): $(MCP_EXT_APP_SRC)
	@mkdir -p out
	esbuild $(MCP_EXT_APP_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(ALIAS_MCP) \
		$(ALIAS_ZOD)

all: $(MCP_EXT_APP_OUT)

clean:
	@rm -rf out/*

.PHONY: all clean