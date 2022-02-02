import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import type { VFC } from 'react';

import useFocus from '../hooks/useFocus';
import useStyleSet from '../hooks/useStyleSet';

const { useLocalizer } = hooks;

const CHAT_HISTORY_IMAGE_DARK_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSIxMDkiIGhlaWdodD0iMTk5IiBzdHJva2U9IiM0ODQ2NDQiLz48cmVjdCB4PSIzLjUiIHk9IjQuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxNTYiIHN0cm9rZT0iI0YzRjJGMSIvPjxyZWN0IHg9IjcuNSIgeT0iOC41IiB3aWR0aD0iOTMiIGhlaWdodD0iNDIiIHN0cm9rZT0iI0YzRjJGMSIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+PHJlY3QgeD0iNy41IiB5PSI1NS41IiB3aWR0aD0iOTMiIGhlaWdodD0iOTkiIHN0cm9rZT0iI0YzRjJGMSIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+PHJlY3QgeD0iMy41IiB5PSIxODIuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxMyIgc3Ryb2tlPSIjNDg0NjQ0Ii8+PHJlY3QgeD0iMy41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiM0ODQ2NDQiLz48cmVjdCB4PSIzOC41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiM0ODQ2NDQiLz48cmVjdCB4PSI3My41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiM0ODQ2NDQiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTExNi4zMjggNy42NDY0NUMxMTYuNTI0IDcuNDUxMTggMTE2Ljg0IDcuNDUxMTggMTE3LjAzNiA3LjY0NjQ1TDEyMC4yMTggMTAuODI4NEMxMjAuNDEzIDExLjAyMzcgMTIwLjQxMyAxMS4zNDAzIDEyMC4yMTggMTEuNTM1NUMxMjAuMDIyIDExLjczMDggMTE5LjcwNiAxMS43MzA4IDExOS41MSAxMS41MzU1TDExNy4xODIgOS4yMDcxMVYxNTYuNzkzTDExOS41MSAxNTQuNDY0QzExOS43MDYgMTU0LjI2OSAxMjAuMDIyIDE1NC4yNjkgMTIwLjIxOCAxNTQuNDY0QzEyMC40MTMgMTU0LjY2IDEyMC40MTMgMTU0Ljk3NiAxMjAuMjE4IDE1NS4xNzJMMTE3LjAzNiAxNTguMzU0QzExNi44NCAxNTguNTQ5IDExNi41MjQgMTU4LjU0OSAxMTYuMzI4IDE1OC4zNTRMMTEzLjE0NiAxNTUuMTcyQzExMi45NTEgMTU0Ljk3NiAxMTIuOTUxIDE1NC42NiAxMTMuMTQ2IDE1NC40NjRDMTEzLjM0MiAxNTQuMjY5IDExMy42NTggMTU0LjI2OSAxMTMuODU0IDE1NC40NjRMMTE2LjE4MiAxNTYuNzkzVjkuMjA3MTFMMTEzLjg1NCAxMS41MzU1QzExMy42NTggMTEuNzMwOCAxMTMuMzQyIDExLjczMDggMTEzLjE0NiAxMS41MzU1QzExMi45NTEgMTEuMzQwMyAxMTIuOTUxIDExLjAyMzcgMTEzLjE0NiAxMC44Mjg0TDExNi4zMjggNy42NDY0NVoiIGZpbGw9IiNGM0YyRjEiLz48L3N2Zz4=';

const CHAT_HISTORY_IMAGE_HIGH_CONTRAST_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSIxMDkiIGhlaWdodD0iMTk5IiBzdHJva2U9IndoaXRlIi8+PHJlY3QgeD0iMy41IiB5PSI0LjUiIHdpZHRoPSIxMDIiIGhlaWdodD0iMTU2IiBzdHJva2U9IndoaXRlIi8+PHJlY3QgeD0iNy41IiB5PSI4LjUiIHdpZHRoPSI5MyIgaGVpZ2h0PSI0MiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+PHJlY3QgeD0iNy41IiB5PSI1NS41IiB3aWR0aD0iOTMiIGhlaWdodD0iOTkiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1kYXNoYXJyYXk9IjIgMiIvPjxyZWN0IHg9IjMuNSIgeT0iMTgyLjUiIHdpZHRoPSIxMDIiIGhlaWdodD0iMTMiIHN0cm9rZT0id2hpdGUiLz48cmVjdCB4PSIzLjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0id2hpdGUiLz48cmVjdCB4PSIzOC41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IndoaXRlIi8+PHJlY3QgeD0iNzMuNSIgeT0iMTY1LjUiIHdpZHRoPSIzMiIgaGVpZ2h0PSIxMyIgc3Ryb2tlPSJ3aGl0ZSIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTE2LjMyOCA3LjY0NjQ1QzExNi41MjQgNy40NTExOCAxMTYuODQgNy40NTExOCAxMTcuMDM2IDcuNjQ2NDVMMTIwLjIxOCAxMC44Mjg0QzEyMC40MTMgMTEuMDIzNyAxMjAuNDEzIDExLjM0MDMgMTIwLjIxOCAxMS41MzU1QzEyMC4wMjIgMTEuNzMwOCAxMTkuNzA2IDExLjczMDggMTE5LjUxIDExLjUzNTVMMTE3LjE4MiA5LjIwNzExVjE1Ni43OTNMMTE5LjUxIDE1NC40NjRDMTE5LjcwNiAxNTQuMjY5IDEyMC4wMjIgMTU0LjI2OSAxMjAuMjE4IDE1NC40NjRDMTIwLjQxMyAxNTQuNjYgMTIwLjQxMyAxNTQuOTc2IDEyMC4yMTggMTU1LjE3MkwxMTcuMDM2IDE1OC4zNTRDMTE2Ljg0IDE1OC41NDkgMTE2LjUyNCAxNTguNTQ5IDExNi4zMjggMTU4LjM1NEwxMTMuMTQ2IDE1NS4xNzJDMTEyLjk1MSAxNTQuOTc2IDExMi45NTEgMTU0LjY2IDExMy4xNDYgMTU0LjQ2NEMxMTMuMzQyIDE1NC4yNjkgMTEzLjY1OCAxNTQuMjY5IDExMy44NTQgMTU0LjQ2NEwxMTYuMTgyIDE1Ni43OTNWOS4yMDcxMUwxMTMuODU0IDExLjUzNTVDMTEzLjY1OCAxMS43MzA4IDExMy4zNDIgMTEuNzMwOCAxMTMuMTQ2IDExLjUzNTVDMTEyLjk1MSAxMS4zNDAzIDExMi45NTEgMTEuMDIzNyAxMTMuMTQ2IDEwLjgyODRMMTE2LjMyOCA3LjY0NjQ1WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';

const CHAT_HISTORY_IMAGE_LIGHT_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSIxMDkiIGhlaWdodD0iMTk5IiBzdHJva2U9IiNDOEM2QzQiLz48cmVjdCB4PSIzLjUiIHk9IjQuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxNTYiIHN0cm9rZT0iIzMyMzEzMCIvPjxyZWN0IHg9IjcuNSIgeT0iOC41IiB3aWR0aD0iOTMiIGhlaWdodD0iNDIiIHN0cm9rZT0iIzMyMzEzMCIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+PHJlY3QgeD0iNy41IiB5PSI1NS41IiB3aWR0aD0iOTMiIGhlaWdodD0iOTkiIHN0cm9rZT0iIzMyMzEzMCIgc3Ryb2tlLWRhc2hhcnJheT0iMiAyIi8+PHJlY3QgeD0iMy41IiB5PSIxODIuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxMyIgc3Ryb2tlPSIjQzhDNkM0Ii8+PHJlY3QgeD0iMy41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiNDOEM2QzQiLz48cmVjdCB4PSIzOC41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiNDOEM2QzQiLz48cmVjdCB4PSI3My41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiNDOEM2QzQiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTExNi4zMjggNy42NDY0NUMxMTYuNTI0IDcuNDUxMTggMTE2Ljg0IDcuNDUxMTggMTE3LjAzNiA3LjY0NjQ1TDEyMC4yMTggMTAuODI4NEMxMjAuNDEzIDExLjAyMzcgMTIwLjQxMyAxMS4zNDAzIDEyMC4yMTggMTEuNTM1NUMxMjAuMDIyIDExLjczMDggMTE5LjcwNiAxMS43MzA4IDExOS41MSAxMS41MzU1TDExNy4xODIgOS4yMDcxMVYxNTYuNzkzTDExOS41MSAxNTQuNDY0QzExOS43MDYgMTU0LjI2OSAxMjAuMDIyIDE1NC4yNjkgMTIwLjIxOCAxNTQuNDY0QzEyMC40MTMgMTU0LjY2IDEyMC40MTMgMTU0Ljk3NiAxMjAuMjE4IDE1NS4xNzJMMTE3LjAzNiAxNTguMzU0QzExNi44NCAxNTguNTQ5IDExNi41MjQgMTU4LjU0OSAxMTYuMzI4IDE1OC4zNTRMMTEzLjE0NiAxNTUuMTcyQzExMi45NTEgMTU0Ljk3NiAxMTIuOTUxIDE1NC42NiAxMTMuMTQ2IDE1NC40NjRDMTEzLjM0MiAxNTQuMjY5IDExMy42NTggMTU0LjI2OSAxMTMuODU0IDE1NC40NjRMMTE2LjE4MiAxNTYuNzkzVjkuMjA3MTFMMTEzLjg1NCAxMS41MzU1QzExMy42NTggMTEuNzMwOCAxMTMuMzQyIDExLjczMDggMTEzLjE0NiAxMS41MzU1QzExMi45NTEgMTEuMzQwMyAxMTIuOTUxIDExLjAyMzcgMTEzLjE0NiAxMC44Mjg0TDExNi4zMjggNy42NDY0NVoiIGZpbGw9IiMzMjMxMzAiLz48L3N2Zz4=';

const CHAT_WINDOW_IMAGE_DARK_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTA5IiBoZWlnaHQ9IjE5OSIgc3Ryb2tlPSIjNDg0NjQ0Ii8+CjxyZWN0IHg9IjMuNSIgeT0iNC41IiB3aWR0aD0iMTAyIiBoZWlnaHQ9IjE1NiIgc3Ryb2tlPSIjRjNGMkYxIi8+CjxyZWN0IHg9IjcuNSIgeT0iOC41IiB3aWR0aD0iOTMiIGhlaWdodD0iNDIiIHN0cm9rZT0iIzQ4NDY0NCIvPgo8cmVjdCB4PSI3LjUiIHk9IjU1LjUiIHdpZHRoPSI5MyIgaGVpZ2h0PSI5OSIgc3Ryb2tlPSIjNDg0NjQ0Ii8+CjxyZWN0IHg9IjMuNSIgeT0iMTgyLjUiIHdpZHRoPSIxMDIiIGhlaWdodD0iMTMiIHN0cm9rZT0iI0YzRjJGMSIvPgo8cmVjdCB4PSIzLjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0iI0YzRjJGMSIvPgo8cmVjdCB4PSIzOC41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiNGM0YyRjEiLz4KPHJlY3QgeD0iNzMuNSIgeT0iMTY1LjUiIHdpZHRoPSIzMiIgaGVpZ2h0PSIxMyIgc3Ryb2tlPSIjRjNGMkYxIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTE2LjMyOCA1LjY0NjQ1QzExNi41MjQgNS40NTExOCAxMTYuODQgNS40NTExOCAxMTcuMDM2IDUuNjQ2NDVMMTIwLjIxOCA4LjgyODQzQzEyMC40MTMgOS4wMjM2OSAxMjAuNDEzIDkuMzQwMjcgMTIwLjIxOCA5LjUzNTUzQzEyMC4wMjIgOS43MzA4IDExOS43MDYgOS43MzA4IDExOS41MSA5LjUzNTUzTDExNy4xODIgNy4yMDcxMVYxOTIuNzkzTDExOS41MSAxOTAuNDY0QzExOS43MDYgMTkwLjI2OSAxMjAuMDIyIDE5MC4yNjkgMTIwLjIxOCAxOTAuNDY0QzEyMC40MTMgMTkwLjY2IDEyMC40MTMgMTkwLjk3NiAxMjAuMjE4IDE5MS4xNzJMMTE3LjAzNiAxOTQuMzU0QzExNi44NCAxOTQuNTQ5IDExNi41MjQgMTk0LjU0OSAxMTYuMzI4IDE5NC4zNTRMMTEzLjE0NiAxOTEuMTcyQzExMi45NTEgMTkwLjk3NiAxMTIuOTUxIDE5MC42NiAxMTMuMTQ2IDE5MC40NjRDMTEzLjM0MiAxOTAuMjY5IDExMy42NTggMTkwLjI2OSAxMTMuODU0IDE5MC40NjRMMTE2LjE4MiAxOTIuNzkzVjcuMjA3MTFMMTEzLjg1NCA5LjUzNTUzQzExMy42NTggOS43MzA4IDExMy4zNDIgOS43MzA4IDExMy4xNDYgOS41MzU1M0MxMTIuOTUxIDkuMzQwMjcgMTEyLjk1MSA5LjAyMzY5IDExMy4xNDYgOC44Mjg0M0wxMTYuMzI4IDUuNjQ2NDVaIiBmaWxsPSIjRjNGMkYxIi8+Cjwvc3ZnPgo=';

const CHAT_WINDOW_IMAGE_HIGH_CONTRAST_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTA5IiBoZWlnaHQ9IjE5OSIgc3Ryb2tlPSJ3aGl0ZSIvPgo8cmVjdCB4PSIzLjUiIHk9IjQuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxNTYiIHN0cm9rZT0id2hpdGUiLz4KPHJlY3QgeD0iNy41IiB5PSI4LjUiIHdpZHRoPSI5MyIgaGVpZ2h0PSI0MiIgc3Ryb2tlPSJ3aGl0ZSIvPgo8cmVjdCB4PSI3LjUiIHk9IjU1LjUiIHdpZHRoPSI5MyIgaGVpZ2h0PSI5OSIgc3Ryb2tlPSJ3aGl0ZSIvPgo8cmVjdCB4PSIzLjUiIHk9IjE4Mi41IiB3aWR0aD0iMTAyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IndoaXRlIi8+CjxyZWN0IHg9IjMuNSIgeT0iMTY1LjUiIHdpZHRoPSIzMiIgaGVpZ2h0PSIxMyIgc3Ryb2tlPSJ3aGl0ZSIvPgo8cmVjdCB4PSIzOC41IiB5PSIxNjUuNSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IndoaXRlIi8+CjxyZWN0IHg9IjczLjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMTYuMzI4IDUuNjQ2NDVDMTE2LjUyNCA1LjQ1MTE4IDExNi44NCA1LjQ1MTE4IDExNy4wMzYgNS42NDY0NUwxMjAuMjE4IDguODI4NDNDMTIwLjQxMyA5LjAyMzY5IDEyMC40MTMgOS4zNDAyNyAxMjAuMjE4IDkuNTM1NTNDMTIwLjAyMiA5LjczMDggMTE5LjcwNiA5LjczMDggMTE5LjUxIDkuNTM1NTNMMTE3LjE4MiA3LjIwNzExVjE5Mi43OTNMMTE5LjUxIDE5MC40NjRDMTE5LjcwNiAxOTAuMjY5IDEyMC4wMjIgMTkwLjI2OSAxMjAuMjE4IDE5MC40NjRDMTIwLjQxMyAxOTAuNjYgMTIwLjQxMyAxOTAuOTc2IDEyMC4yMTggMTkxLjE3MkwxMTcuMDM2IDE5NC4zNTRDMTE2Ljg0IDE5NC41NDkgMTE2LjUyNCAxOTQuNTQ5IDExNi4zMjggMTk0LjM1NEwxMTMuMTQ2IDE5MS4xNzJDMTEyLjk1MSAxOTAuOTc2IDExMi45NTEgMTkwLjY2IDExMy4xNDYgMTkwLjQ2NEMxMTMuMzQyIDE5MC4yNjkgMTEzLjY1OCAxOTAuMjY5IDExMy44NTQgMTkwLjQ2NEwxMTYuMTgyIDE5Mi43OTNWNy4yMDcxMUwxMTMuODU0IDkuNTM1NTNDMTEzLjY1OCA5LjczMDggMTEzLjM0MiA5LjczMDggMTEzLjE0NiA5LjUzNTUzQzExMi45NTEgOS4zNDAyNyAxMTIuOTUxIDkuMDIzNjkgMTEzLjE0NiA4LjgyODQzTDExNi4zMjggNS42NDY0NVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

const CHAT_WINDOW_IMAGE_LIGHT_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIxIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEyMSAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSIxMDkiIGhlaWdodD0iMTk5IiBzdHJva2U9IiNDOEM2QzQiLz48cmVjdCB4PSIzLjUiIHk9IjQuNSIgd2lkdGg9IjEwMiIgaGVpZ2h0PSIxNTYiIHN0cm9rZT0iIzMyMzEzMCIvPjxyZWN0IHg9IjcuNSIgeT0iOC41IiB3aWR0aD0iOTMiIGhlaWdodD0iNDIiIHN0cm9rZT0iI0M4QzZDNCIvPjxyZWN0IHg9IjcuNSIgeT0iNTUuNSIgd2lkdGg9IjkzIiBoZWlnaHQ9Ijk5IiBzdHJva2U9IiNDOEM2QzQiLz48cmVjdCB4PSIzLjUiIHk9IjE4Mi41IiB3aWR0aD0iMTAyIiBoZWlnaHQ9IjEzIiBzdHJva2U9IiMzMjMxMzAiLz48cmVjdCB4PSIzLjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0iIzMyMzEzMCIvPjxyZWN0IHg9IjM4LjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0iIzMyMzEzMCIvPjxyZWN0IHg9IjczLjUiIHk9IjE2NS41IiB3aWR0aD0iMzIiIGhlaWdodD0iMTMiIHN0cm9rZT0iIzMyMzEzMCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTE2LjMyOCA1LjY0NjQ1QzExNi41MjQgNS40NTExOCAxMTYuODQgNS40NTExOCAxMTcuMDM2IDUuNjQ2NDVMMTIwLjIxOCA4LjgyODQzQzEyMC40MTMgOS4wMjM2OSAxMjAuNDEzIDkuMzQwMjcgMTIwLjIxOCA5LjUzNTUzQzEyMC4wMjIgOS43MzA4IDExOS43MDYgOS43MzA4IDExOS41MSA5LjUzNTUzTDExNy4xODIgNy4yMDcxMVYxOTIuNzkzTDExOS41MSAxOTAuNDY0QzExOS43MDYgMTkwLjI2OSAxMjAuMDIyIDE5MC4yNjkgMTIwLjIxOCAxOTAuNDY0QzEyMC40MTMgMTkwLjY2IDEyMC40MTMgMTkwLjk3NiAxMjAuMjE4IDE5MS4xNzJMMTE3LjAzNiAxOTQuMzU0QzExNi44NCAxOTQuNTQ5IDExNi41MjQgMTk0LjU0OSAxMTYuMzI4IDE5NC4zNTRMMTEzLjE0NiAxOTEuMTcyQzExMi45NTEgMTkwLjk3NiAxMTIuOTUxIDE5MC42NiAxMTMuMTQ2IDE5MC40NjRDMTEzLjM0MiAxOTAuMjY5IDExMy42NTggMTkwLjI2OSAxMTMuODU0IDE5MC40NjRMMTE2LjE4MiAxOTIuNzkzVjcuMjA3MTFMMTEzLjg1NCA5LjUzNTUzQzExMy42NTggOS43MzA4IDExMy4zNDIgOS43MzA4IDExMy4xNDYgOS41MzU1M0MxMTIuOTUxIDkuMzQwMjcgMTEyLjk1MSA5LjAyMzY5IDExMy4xNDYgOC44Mjg0M0wxMTYuMzI4IDUuNjQ2NDVaIiBmaWxsPSIjMzIzMTMwIi8+PC9zdmc+';

type NotesBodyProps = {
  header: string;
  text: string;
};

const Notes: VFC<NotesBodyProps> = ({ header, text }) => (
  <section className="webchat__keyboard-help__notes">
    <h4 className="webchat__keyboard-help__notes-header">{header}</h4>
    {text.split('\n').map((line, index) => (
      // We are splitting lines into paragraphs, index as key is legitimate here.
      // eslint-disable-next-line react/no-array-index-key
      <p className="webchat__keyboard-help__notes-text" key={index}>
        {line}
      </p>
    ))}
  </section>
);

Notes.propTypes = {
  header: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

const KeyboardHelp: VFC<{}> = () => {
  const [{ keyboardHelp: keyboardHelpStyleSet }] = useStyleSet();
  const focus = useFocus();
  const localize = useLocalizer();

  const header = localize('KEYBOARD_HELP_HEADER');
  const closeButtonAlt = localize('KEYBOARD_HELP_CLOSE_BUTTON_ALT');
  const chatWindowBodyDoActionBody = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_DO_ACTION_BODY');
  const chatWindowBodyDoActionHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_DO_ACTION_HEADER');
  const chatWindowBodyMoveBetweenItemsBody = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_MOVE_BETWEEN_ITEMS_BODY');
  const chatWindowBodyMoveBetweenItemsHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_MOVE_BETWEEN_ITEMS_HEADER');
  const chatWindowHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_HEADER');
  const chatHistoryHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_HEADER');
  const chatHistoryMoveBetweenMessagesBody = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_MESSAGES_BODY');
  const chatHistoryMoveBetweenMessagesHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_MESSAGES_HEADER');
  const chatHistoryMoveBetweenItemsBody = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_ITEMS_BODY');
  const chatHistoryMoveBetweenItemsHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_ITEMS_HEADER');
  const chatHistoryLeaveMessageBody = localize('KEYBOARD_HELP_CHAT_HISTORY_LEAVE_MESSAGE_BODY');
  const chatHistoryLeaveMessageHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_LEAVE_MESSAGE_HEADER');
  const chatHistoryAccessItemsInMessageBody = localize('KEYBOARD_HELP_CHAT_HISTORY_ACCESS_ITEMS_IN_MESSAGE_BODY');
  const chatHistoryAccessItemsInMessageHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_ACCESS_ITEMS_IN_MESSAGE_HEADER');

  const handleCloseButtonClick = useCallback(() => focus('sendBox'), [focus]);

  const handleKeyDown = useCallback(
    ({ key }) => (key === 'Enter' || key === 'Escape' || key === 'Space') && focus('sendBox'),
    [focus]
  );

  const [shown, setShown] = useState(false);

  const handleBlur = useCallback(
    // We will keep the help screen shown if the blur is caused by switch app.
    // When switch app, `document.activeElement` will remains.
    event => document.activeElement !== event.target && setShown(false),
    [setShown]
  );

  const handleFocusWithin = useCallback(() => setShown(true), [setShown]);

  return (
    <div
      className={classNames('webchat__keyboard-help', keyboardHelpStyleSet + '', {
        'webchat__keyboard-help--shown': shown
      })}
      onBlur={handleBlur}
      onFocus={handleFocusWithin}
      onKeyDown={handleKeyDown}
      role="dialog"
      tabIndex={0}
    >
      <div className="webchat__keyboard-help__box">
        <header>
          <h2 className="webchat__keyboard-help__header">{header}</h2>
        </header>
        <button
          aria-label={closeButtonAlt}
          className="webchat__keyboard-help__close-button"
          onClick={handleCloseButtonClick}
          onFocus={handleFocusWithin}
          tabIndex={-1}
          type="button"
        >
          {'&times;'}
        </button>
        <article className="webchat__keyboard-help__section">
          <header>
            <h3 className="webchat__keyboard-help__sub-header">{chatWindowHeader}</h3>
          </header>
          <div className="webchat__keyboard-help__two-panes">
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--light"
              src={CHAT_WINDOW_IMAGE_LIGHT_BASE64}
            />
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--dark"
              src={CHAT_WINDOW_IMAGE_DARK_BASE64}
            />
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--high-contrast"
              src={CHAT_WINDOW_IMAGE_HIGH_CONTRAST_BASE64}
            />
            <div className="webchat__keyboard-help__notes-pane">
              <Notes header={chatWindowBodyMoveBetweenItemsHeader} text={chatWindowBodyMoveBetweenItemsBody} />
              <Notes header={chatWindowBodyDoActionHeader} text={chatWindowBodyDoActionBody} />
            </div>
          </div>
        </article>
        <article className="webchat__keyboard-help__section">
          <header>
            <h3 className="webchat__keyboard-help__header">{chatHistoryHeader}</h3>
          </header>
          <div className="webchat__keyboard-help__two-panes">
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--light"
              src={CHAT_HISTORY_IMAGE_LIGHT_BASE64}
            />
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--dark"
              src={CHAT_HISTORY_IMAGE_DARK_BASE64}
            />
            <img
              alt=""
              className="webchat__keyboard-help__image webchat__keyboard-help__image--high-contrast"
              src={CHAT_HISTORY_IMAGE_HIGH_CONTRAST_BASE64}
            />
            <div className="webchat__keyboard-help__notes-pane">
              <Notes header={chatHistoryMoveBetweenMessagesHeader} text={chatHistoryMoveBetweenMessagesBody} />
              <Notes header={chatHistoryAccessItemsInMessageHeader} text={chatHistoryAccessItemsInMessageBody} />
              <Notes header={chatHistoryMoveBetweenItemsHeader} text={chatHistoryMoveBetweenItemsBody} />
              <Notes header={chatHistoryLeaveMessageHeader} text={chatHistoryLeaveMessageBody} />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default KeyboardHelp;
