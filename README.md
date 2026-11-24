# Calculator


## 🚀 Quick Setup: Run the Calculator from Docker Hub

> **Pull the images, start the shared Compose stack, and open the calculator in your browser.**

### 1. Open a terminal

```sh
mkdir test
cd test
touch compose.yaml
```

### 2. Add `compose.yaml`

Open `compose.yaml` with a text editor, paste the following configuration, and save it:

```yaml
services:
  calculator-api:
    image: bsverma/bhim_seezle:backend
    environment:
      HTTP_ADDR: ":8080"
    restart: unless-stopped

  frontend:
    image: bsverma/bhim_seezle:frontend
    depends_on:
      - calculator-api
    ports:
      - "8088:80"
    restart: unless-stopped
```

Confirm the terminal is inside the directory containing `compose.yaml`:

```sh
pwd
```

### 3. Pull and start the images

```sh
docker compose pull
docker compose up -d
```

Docker creates the shared network and starts both containers:

```text
Network test_default            Created
Container test-calculator-api-1 Started
Container test-frontend-1       Started
```

### 4. Open the calculator

Open <http://localhost:8088>.

### 5. Stop the shared deployment

```sh
docker compose down
```

---

## 1. Overview

 Calculator is a browser-based calculator interface recreated as a local Vite/React project. It provides a responsive dark/light calculator UI, mouse and keyboard input, arithmetic with operator precedence, exponentiation, percentages, decimal editing, backspace, clear, divide-by-zero handling, and persistent theme selection.

Arithmetic is evaluated by the Go calculator service through `POST /api/v1/calculate`. During development, Vite proxies `/api` requests to `http://127.0.0.1:8080`; start the Go service before using the calculator. The `capture/` directory contains artifacts from the original hosted preview and is not part of the Vite application entry point.

## 2. Technology Stack

- **React 19** for component rendering and state management
- **React DOM 19** for mounting the application
- **TypeScript/TSX** for application components and hook logic
- **Vite 6** for local development builds
- **Plain CSS** for global browser resets, calculator layout, themes, and component styles
- **Lucide React** for the backspace and theme icons
- **Work Sans** for calculator typography; the font is loaded remotely from Google Fonts

## 3. Project Structure

```text
.
├── README.md                 # Project documentation
├── index.html                # Vite HTML entry point
├── package.json              # Scripts and direct dependencies
├── package-lock.json         # npm reproducible dependency lock
├── vite.config.js            # Vite aliases, JSX handling, and development API proxy
├── Dockerfile                # Frontend build plus Nginx runtime image
├── nginx.conf                # Static serving and /api reverse proxy configuration
├── public/
│   └── .gitkeep              # Placeholder for public static assets
├── src/
│   ├── index.js              # Browser entry; mounts the React application
│   ├── App.tsx               # App shell, theme state, and keyboard handling
│   ├── App.css               # Calculator layout, themes, and component styles
│   ├── index.css             # Global CSS reset and document defaults
│   ├── api/
│   │   └── calculator.ts     # Operator types and arithmetic implementation
│   ├── components/calculator/
│   │   ├── CalcKey.tsx       # Reusable keypad button
│   │   ├── Display.tsx       # Expression history and result display
│   │   ├── Keypad.tsx        # Calculator key layout and actions
│   │   └── ThemeToggle.tsx   # Light/dark mode control
│   └── hooks/
│       └── useCalculator.ts  # Expression state and live evaluation engine
└── capture/
    ├── index.html            # Captured hosted preview document
    └── static/js/
        ├── bundle.js         # Captured webpack browser bundle
        └── bundle.js.map     # Source map used to recover source files
```

The `.DS_Store` file is an editor-generated macOS metadata file and has no application purpose.

## 4. Installation and Running

### Requirements

- Node.js 22 or newer is recommended
- npm

### Install

```sh
npm ci
```

`npm ci` installs exactly the dependency versions recorded in `package-lock.json`.

### Development server

```sh
npm start
```

or:

```sh
npm run dev
```

Vite serves the application and prints a local URL. Open that URL in a browser.

In a second terminal, start the Go API from the `calculator/` directory:

```sh
go run ./cmd/api
```

The Vite development server proxies API requests to the default backend address `127.0.0.1:8080`. Set `CALCULATOR_API_TARGET` when the Go service listens elsewhere, for example `CALCULATOR_API_TARGET=http://127.0.0.1:8081 npm run dev`.

### Production build

```sh
npm run build
```

The static build is written to Vite's `dist/` directory.

### Preview a production build

```sh
npm run preview
```

## 5. Application Startup

`index.html` provides a document with a `div#root` element and loads `/src/index.js` as an ES module.

`src/index.js`:

1. Imports React and `react-dom/client`.
2. Imports the global CSS stylesheet.
3. Imports `App`.
4. Creates a React root and renders `App` inside strict mode.

## 6. Component Architecture

```text
index.js
└── App
  ├── ThemeToggle
  ├── Display
  └── Keypad
    └── CalcKey (× 17)
```

### `App.tsx`

`App` owns the visual theme and instantiates `useCalculator()`.

The theme is initialized from `localStorage["calc-theme"]` and defaults to `dark`. Every theme change is persisted to the same key. The only valid application values are `light` and `dark`.

The root element receives a class of `theme-light` or `theme-dark` together with `calc-app`. This enables the CSS custom-property theme switch.

`App` also registers one `keydown` listener:

- Digits `0`–`9`: input a digit
- `.`: input a decimal point
- `+`, `-`, `*`, `/`, `^`: choose the corresponding operator
- `Enter` or `=`: evaluate
- `Backspace`: delete the current input or remove an operator
- `Escape`: clear
- `%`: apply percentage

The listener is removed when the component unmounts. Because `useCalculator()` returns freshly-created callback values from the hook depending on state, the effect may reattach the listener when dependencies change.

### `ThemeToggle.tsx`

This button displays a sun icon in light mode or a moon icon in dark mode and changes modes through `onToggle`. It includes an accessible dynamic label such as "Switch to light mode" or "Switch to dark mode".

The visual thumb is moved with CSS according to `theme-light` or `theme-dark`.

### `Display.tsx`

The display has two sections:

- `display__history`: the expression text currently being entered
- `display__value`: the live calculated result or error

Font size automatically decreases for values longer than 8 characters and decreases further for values longer than 12 characters. Errors receive a red error style. During recalculation, the value receives a reduced-opacity loading style.

### `CalcKey.tsx`

`CalcKey` is the reusable `<button>` primitive. It supports:

- `number`: dark/light number-key surface
- `function`: C, exponent, and percent surface
- `operator`: colored arithmetic/evaluate surface

Each key has a test ID, optional accessible label, click handler, and optional active state.

### `Keypad.tsx`

The keypad is a 4-column CSS grid arranged in this order:

```text
AC  xʸ  %  ÷
7  8   9  ×
4  5   6  −
1  2   3  +
.  0  delete  =
```

The exponent button is represented as `x^y` in the UI but stores the operator `^`. The last selected operator is highlighted through `activeOp`.

## 7. Calculator State Model

`src/hooks/useCalculator.ts` stores calculator expressions using this state shape:

```ts
interface CalcState {
  nums: string[];
  ops: Operator[];
  justEvaluated: boolean;
}

const initial = {
  nums: ["0"],
  ops: [],
  justEvaluated: false,
};
```

- `nums` contains number tokens as strings, preserving decimal input and minus signs.
- `ops` contains operator tokens.
- `justEvaluated` indicates that the expression was submitted with `=`.

The array model allows the UI to distinguish:

- A number after the initial zero: `nums = ["2"]`
- A complete expression: `nums = ["2", "3"]`, `ops = ["+"]`
- An operator awaiting a right-hand operand: `nums.length === ops.length`

This representation is not a parsed expression tree. The arrays are sent together to the backend for evaluation.

## 8. Live Expression Evaluation

When a complete expression changes, the hook schedules a debounced preview request. A standalone number is displayed locally, and a trailing operator does not trigger a request.

```text
nums: ["2", "3", "4"]
ops:  ["+", "×"]
```

The backend processes operators in precedence levels:

1. `^`, calculated right-to-left
2. `×` and `÷`, calculated left-to-right
3. `+` and `-`, calculated left-to-right

The hook sends all complete operands and their operators in one request. A 150 ms debounce coalesces rapid key entry, and the effect ignores results from requests superseded by newer input.

The current partial evaluation is stored in `res`. The result is replaced by an error response for divide-by-zero or non-finite operations.

`loading` is set while a preview is pending or running and cleared after it resolves.

## 9. Arithmetic API Module

`src/api/calculator.ts` defines:

```ts
export type Operator = "+" | "-" | "×" | "÷" | "^";

export interface CalculateResponse {
  result: number | null;
  error?: string;
}
```

### Backend API integration

The frontend sends each complete expression to:

```text
POST /api/v1/calculate
Content-Type: application/json
```

The JSON request contains an infix `expression` string, for example `{ "expression": "1+2*3" }`. The backend supports `+`, `-`, `*`, `/`, `^`, parentheses, decimal numbers, and scientific notation. The API returns `{ "result": number }` for success and `{ "error": string }` for errors. The frontend displays server errors and reports when the service cannot be reached.

In production, configure the web server to route `/api` to the Go service; the Vite proxy is for local development only.

## 10. Input Behavior

### Digit input

Digits modify the current number. If the current number is `0`, it is replaced by the typed digit instead of becoming `06`. The string is limited to 15 digits, excluding `-` and `.`. Digits are ignored once that limit is reached.

### Decimal input

A decimal starts a new number as `0.`. A second decimal point or decimal on an exponent result is ignored.

### Operator selection

Selecting an operator adds it after the current number. If an operator already waits after a number, the newest operator replaces the previous one. Selecting an operator after a completed evaluation continues from the result.

### Equals

Pressing `=` prevents a dangling trailing operator from being treated as an operation. The expression is marked `justEvaluated`. Subsequent editing or operator selection begins a new editing model based on the previous result.

### Clear

Clear restores the initial state: zero, no operators, and `justEvaluated = false`.

### Backspace

- After evaluation, backspace clears the entire expression.
- With a trailing operator, backspace removes that operator.
- Otherwise, it removes the final character from the current number.
- If an input becomes empty or is reduced to `-`, backspace adjusts the state; if it is the only number, it resets to zero.

### Percent

Percent divides the current number by `100` and stores it as a compact string. It uses `toPrecision(12)` to reduce floating-point noise. Percent is ignored when no current number is available.

## 11. Formatting and Display

`formatNumber()` adds US-style thousands separators to the integer portion while preserving decimals. For example:

```text
1234.56 → 1,234.56
```

Negative numbers receive a leading minus sign.

`toRaw()` switches to exponential notation for:

- Absolute values greater than or equal to `1e15`
- Nonzero absolute values less than `1e-9`

It uses six decimal places in exponential mode and removes unnecessary trailing zeros before `e`.

`fmt()` applies display grouping to ordinary numbers and leaves exponent notation ungrouped.

The expression history uses unicode minus (`−`) for display, while internal subtraction remains `-`.

## 12. Styling

### `App.css`

The main stylesheet defines CSS custom properties for the two themes:

**Dark theme**

- Background: `#17171c`
- Number keys: `#2e2f38`
- Function keys: `#4e505f`
- Operator keys: `#4b5efc`
- Text: white

**Light theme**

- Background: `#f1f2f3`
- Number keys: white
- Function keys: `#d2d3da`
- Text: black

The `.calc-shell` is full-height and limited to a width of 760 pixels. The keypad uses a repeat(4, 1fr) grid with 16-pixel gaps.

Keys are 72 pixels tall by default, become 60 pixels tall for viewports shorter than 700 pixels, and include:

- Hover brightness changes
- Pressed scale transforms
- Visible keyboard focus outlines
- Smooth theme and background transitions

The home indicator is a 134 × 5 pixel decorative element at the bottom.

The app uses the remote Work Sans font. The fallback is sans-serif.

### `index.css`

This stylesheet defines a small browser reset and document defaults using plain CSS. The calculator's colors, themes, layout, and component styling are defined in `App.css`.

## 13. Build Configuration

### `vite.config.js`

Vite is configured to:

- Alias `@` to `src/`
- Replace `process.env.REACT_APP_BACKEND_URL` with `""`
- Enable automatic JSX transformation
- Add JSX transformation support for `src/index.js`

The pre-plugin named `calculator-entry-jsx` uses esbuild to transform `src/index.js` as JSX because that entry file is JavaScript rather than JSX. All project TSX files are handled by Vite/esbuild automatically.

## 14. Package Scripts and Dependencies

| Script | Command | Purpose |
|---|---|---|
| `start` | `vite` | Start the development server |
| `dev` | `vite` | Start the development server |
| `build` | `vite build` | Produce a static build |
| `preview` | `vite preview` | Serve the build locally |

Direct runtime dependencies:

- `lucide-react`
- `react`
- `react-dom`

Direct development dependencies:

- `typescript`
- `@types/react`
- `@types/react-dom`
- `vite`

The lockfile also includes transitive packages and their exact resolved versions.

## 15. Captured Preview Artifacts

### `capture/index.html`

This is a record of the original hosted Emergent preview rather than a local application entry point. It contains:

- Emergent preview metadata and fonts
- Hosting scripts
- A preview error overlay
- Session/network reporting JavaScript
- A redacted overlay token

It is useful for provenance and debugging but should not be used as the application's primary HTML entry point. The local `index.html` intentionally omits the host recorder, analytics, overlay, and token.

### `capture/static/js/bundle.js`

This is a webpack development bundle from the captured preview. It includes bundled application modules and source references. It is not loaded by the local Vite entry point.

### `capture/static/js/bundle.js.map`

This source map contains original source names and recoverable source content used to reconstruct the `src/` tree. It is an archival artifact rather than a build input.

## 16. Verification and Known Limitations

Previously recorded verification confirms a `2 + 3 × 4 =` interaction returned `14`, theme changes were stored in local storage, and keyboard divide-by-zero showed `Cannot divide by 0`.


## The following areas are current limitations:

- The Go backend must be running for calculations; Vite's API proxy is development-only. Docker includes Nginx in the frontend container and routes `/api/` to the Go container; larger deployments may use Nginx or an ingress as a separate infrastructure component.
  
- Styling uses plain CSS, and more component-level CSS organization may be useful as the app grows.

- Digits are limited to 15 characters, but no general expression-length limit exists for history.

- The app has no explicit CSS dark mode media-query behavior; theme is state and local-storage driven.

### Docker and Nginx

The frontend Dockerfile is a multi-stage build:

1. A Node 22 build stage installs locked dependencies and runs TypeScript checking plus `npm run build`.
2. The generated `dist/` directory is copied into an Nginx runtime image.
3. `nginx.conf` is copied into `/etc/nginx/conf.d/default.conf` and is used by Nginx at container startup.

Nginx is included in the frontend container for this local Compose deployment. It serves the static Vite files and proxies browser requests whose URL starts with `/api/` to `calculator-api:8080` on the private Compose network:

```nginx
location /api/ {
    proxy_pass http://calculator-api:8080;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

This keeps the browser-facing origin same-origin: frontend requests go to port `8088` and Nginx forwards `/api/` calls to the Go container. Vite's proxy is used only by `npm run dev`; Docker/Nginx does not depend on Vite at runtime.

In a larger real-world deployment, Nginx or another ingress/load balancer is commonly moved into a separate infrastructure component. The included Nginx configuration remains useful for the local Docker deployment and as a reference for that reverse-proxy setup.

## Docker image

A standalone Docker image is provided by `Dockerfile`. It uses a multi-stage build:

1. The build stage uses Node 22 and runs locked dependency installation, TypeScript checking, and `npm run build`.
2. The generated `dist/` directory is copied into an Nginx runtime image.
3. `nginx.conf` serves the static application and proxies `/api/` requests to `calculator-api:8080`.

Build the frontend image from this directory:

```sh
docker build -t calc-frontend:local .
```

Run it on port `8088`:

```sh
docker run --rm -p 8088:80 --name calc-frontend calc-frontend:local
```

For API calls to work outside Docker Compose, the frontend container must be able to resolve a host or service named `calculator-api`. The easiest complete local setup is to use the workspace `compose.yaml`, which connects both containers to the same network:

```sh
docker compose -f ../compose.yaml up -d --build
```

Open <http://localhost:8088>. Test the browser-facing API route:

```sh
curl -i http://localhost:8088/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"27.02+20"}'
```

## API examples

The browser sends a JSON infix-expression payload to the same-origin endpoint:

```sh
curl -i http://localhost:8088/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"27.02+20"}'
```

During local Vite development, the frontend uses the Nginx-like same-origin path `/api/v1/calculate`; `vite.config.js` proxies it to `http://127.0.0.1:8080`. In Docker, Nginx performs the `/api/` proxy instead.

Successful result:

```json
{"result":47.02}
```

Invalid trailing operator:

```sh
curl -i http://localhost:8088/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"1+4+3-"}'
```

Division by zero:

```sh
curl -i http://localhost:8088/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"expression":"1/0"}'
```

Frontend error handling is implemented in `src/api/calculator.ts`: API error messages are returned as `error`, invalid/non-finite results are mapped to an explanatory error, and network failures return `Unable to reach calculator service`.

## Frontend design decisions and assumptions

- React state in `useCalculator.ts` stores numbers and operators separately so keypad editing can preserve decimal and minus-sign input without parsing display text.
- Live expressions are debounced for 150 ms, reducing API calls during rapid typing while keeping complete expressions on screen.
- API results are treated as the source of truth for arithmetic. The frontend formats and displays those results but does not re-evaluate the expression locally.
- A trailing operator is not sent; it is incomplete input and produces no preview request.
- Pressing `=` hides the entered expression history and shows only the result. Backspace after evaluation clears the expression, as defined by the calculator interaction model.
- Pressing a digit after evaluation starts a new calculation; pressing a decimal, operator, or percent continues from the result where applicable.
- Plain CSS is used instead of a utility framework because the application uses a small set of custom component styles and themes.
- Vite is used for development/build tooling, but Docker production runtime behavior is provided by Nginx rather than a Vite server.
- The UI assumes localStorage is available for theme persistence. A restricted browser context could require a fallback implementation.
