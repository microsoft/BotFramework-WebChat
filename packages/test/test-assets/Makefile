export PATH := $(realpath ../../../node_modules/.bin):$(PATH)

# entry points
REACT_SRC := ./entry/react.js
REACT_JSX_RUNTIME_SRC := ./entry/react-jsx-runtime.js
REACT_DOM_SRC := ./entry/react-dom.js
REACT_DOM_CLIENT_SRC := ./entry/react-dom/client.js

FLUENTUI_REACT_PROVIDER_SRC := ./entry/@fluentui/react-provider.js
FLUENTUI_TOKENS_SRC := ./entry/@fluentui/tokens.js

# build targets

REACT_OUT := out/react.js
REACT_JSX_RUNTIME_OUT := out/react-jsx-runtime.js
REACT_DOM_OUT := out/react-dom.js
REACT_DOM_CLIENT_OUT := out/react-dom/client.js

FLUENTUI_REACT_PROVIDER_OUT := out/@fluentui/react-provider.js
FLUENTUI_TOKENS_OUT := out/@fluentui/tokens.js

# build options
SHARED_FLAGS := --sourcemap --format=esm --bundle --platform=browser

# deps specific options
REACT_FLAGS := --define:process.env.NODE_ENV=\"production\"

FLUENTUI_FLAGS := --alias:out-root/react.js=react \
		--alias:out-root/react-jsx-runtime.js=react-jsx-runtime \
		--alias:out-root/react-dom.js=react-dom \
		--alias:out-root/react-dom/client.js=react-dom/client.js \
		--external:react \
		--external:react-dom \
		--external:react-dom/client.js \
		--external:react-jsx-runtime

# aliases
ALIAS_JSX_RUNTIME := --alias:react/jsx-runtime=./module/react-jsx-runtime.js --alias:react-jsx-runtime=./module/react-jsx-runtime.js
ALIAS_REACT := --alias:react=./module/react.js
ALIAS_REACT_DOM := --alias:react-dom=./module/react-dom.js
ALIAS_REACT_DOM_CLIENT := --alias:react-dom/client=./module/react-dom/client.js

# build rules
$(REACT_OUT): $(REACT_SRC)
	@mkdir -p out
	esbuild $(REACT_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(REACT_FLAGS)

$(REACT_JSX_RUNTIME_OUT): $(REACT_JSX_RUNTIME_SRC) $(REACT_OUT)
	@mkdir -p out
	esbuild $(REACT_JSX_RUNTIME_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(REACT_FLAGS) \
		$(ALIAS_REACT) \
		--alias:out-root/react.js=react \
		--external:react

$(REACT_DOM_OUT): $(REACT_DOM_SRC) $(REACT_OUT)
	@mkdir -p out
	esbuild $(REACT_DOM_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(REACT_FLAGS) \
		$(REACT_DOM_INJECT) \
		$(ALIAS_REACT) \
		--alias:out-root/react.js=react \
		--external:react

$(REACT_DOM_CLIENT_OUT): $(REACT_DOM_CLIENT_SRC) $(REACT_DOM_OUT) $(REACT_OUT)
	@mkdir -p out out/react-dom
	esbuild $(REACT_DOM_CLIENT_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(REACT_FLAGS) \
		$(ALIAS_REACT_DOM) \
		--alias:out-root/react-dom.js=react-dom \
		--external:react-dom

$(FLUENTUI_REACT_PROVIDER_OUT): $(FLUENTUI_REACT_PROVIDER_SRC) $(REACT_OUT) $(REACT_DOM_OUT) $(REACT_JSX_RUNTIME_OUT)
	@mkdir -p out out/@fluentui
	esbuild $(FLUENTUI_REACT_PROVIDER_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(ALIAS_REACT) \
		$(ALIAS_REACT_DOM) \
		$(ALIAS_JSX_RUNTIME) \
		$(FLUENTUI_FLAGS)

$(FLUENTUI_TOKENS_OUT): $(FLUENTUI_TOKENS_SRC) $(REACT_OUT) $(REACT_DOM_OUT) $(REACT_JSX_RUNTIME_OUT)
	@mkdir -p out out/@fluentui
	esbuild $(FLUENTUI_TOKENS_SRC) --outfile=$@ \
		$(SHARED_FLAGS) \
		$(ALIAS_REACT) \
		$(ALIAS_REACT_DOM) \
		$(ALIAS_JSX_RUNTIME) \
		$(FLUENTUI_FLAGS)

all: $(REACT_OUT) $(REACT_JSX_RUNTIME_OUT) $(REACT_DOM_OUT) $(REACT_DOM_CLIENT_OUT) $(FLUENTUI_REACT_PROVIDER_OUT) $(FLUENTUI_TOKENS_OUT)

clean:
	@rm -rf out/*

.PHONY: all clean