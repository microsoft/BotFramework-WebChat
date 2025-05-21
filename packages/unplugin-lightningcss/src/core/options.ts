import type { TransformOptions } from 'lightningcss'
import type { FilterPattern } from 'unplugin'

export type Options = {
  include?: FilterPattern
  exclude?: FilterPattern
  enforce?: 'pre' | 'post' | undefined
  options?: Omit<TransformOptions<any>, 'code' | 'filename'>
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  Pick<Options, 'enforce'>
>

export function resolveOption(options: Options): OptionsResolved {
  return {
    include: options.include || [/\.css$/],
    exclude: options.exclude || [/node_modules/],
    enforce: 'enforce' in options ? options.enforce : 'pre',
    options: options.options || {},
  }
}
