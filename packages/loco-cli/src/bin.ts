#!/usr/bin/env node
/**
 * The `loco` executable.
 *
 * @since 0.0.0
 */
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Command from "effect/cli/Command"
import * as Effect from "effect/Effect"

const loco = Command.make("loco").pipe(Command.withDescription("Compile effect-loco components to UI framework code"))

loco.pipe(Command.run({ version: "0.0.0" }), Effect.provide(NodeServices.layer), NodeRuntime.runMain)
