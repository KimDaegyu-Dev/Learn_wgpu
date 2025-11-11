English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文 [Table of Contents](#toc) 

# [webgpufundamentals.org](/)

#forkongithub>div { background: #000; color: #fff; font-family: arial,sans-serif; text-align: center; font-weight: bold; padding: 5px 40px; font-size: 0.9rem; line-height: 1.3rem; position: relative; transition: 0.5s; display: block; width: 400px; position: absolute; top: 0; right: 0; transform: translateX(160px) rotate(45deg) translate(10px,70px); box-shadow: 4px 4px 10px rgba(0,0,0,0.8); pointer-events: auto; } #forkongithub a { text-decoration: none; color: #fff; } #forkongithub>div:hover { background: #c11; color: #fff; } #forkongithub .contributors { font-size: 0.75rem; background: rgba(255,255,255,0.2); line-height: 1.2; padding: 0.1em; } #forkongithub>div::before,#forkongithub>div::after { content: ""; width: 100%; display: block; position: absolute; top: 1px; left: 0; height: 1px; background: #fff; } #forkongithub>div::after { bottom: 1px; top: auto; } #forkongithub{ z-index: 9999; /\* needed for firefox \*/ overflow: hidden; width: 300px; height: 300px; position: absolute; right: 0; top: 0; pointer-events: none; } #forkongithub svg{ width: 1em; height: 1em; vertical-align: middle; } #forkongithub img { width: 1em; height: 1em; border-radius: 100%; vertical-align: middle; } @media (max-width: 900px) { #forkongithub>div { line-height: 1.2rem; } } @media (max-width: 700px) { #forkongithub { display: none; } } @media (max-width: 410px) { #forkongithub>div { font-size: 0.7rem; transform: translateX(150px) rotate(45deg) translate(20px,40px); } }

[Fix, Fork, Contribute](https://github.com/webgpu/webgpufundamentals)

# WGSL Function Reference

## Bit Reinterpretation Built-in Functions

Function

Parameter Types

Description

 fn bitcast<T>(e : T) -> T 

T is a concrete numeric scalar or concrete numeric vector

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Identity transform.  
Component-wise when `T` is a vector.  
The result is `e`.

 fn bitcast<T>(e : S) -> T 

S is i32, u32, or f32 T is not S and is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Reinterpretation of bits as `T`.  
The result is the reintepretation of bits in `e` as a `T` value.

 fn bitcast<vecN<T>>(e : vecN<S>) -> T 

S is i32, u32, or f32 T is not S and is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Component-wise reinterpretation of bits as `T`.  
The result is the reintepretation of bits in `e` as a `vecN<T>` value.

 fn bitcast<T>(e : vec2<f16>) -> T 

T is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Component-wise reinterpretation of bits as `T`.  
The result is the reintepretation of the 32 bits in `e` as a `T` value, following the internal layout rules.

 fn bitcast<vec2<T>>(e : vec4<f16>) -> vec2<T> 

T is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Component-wise reinterpretation of bits as `T`.  
The result is the reintepretation of the 64 bits in `e` as a `T` value, following the internal layout rules.

 fn bitcast<vec2<f16>>(e : T) -> vec2<f16> 

T is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Component-wise reinterpretation of bits as f16.  
The result is the reintepretation of the 32 bits in `e` as an f16 value, following the internal layout rules.

 fn bitcast<vec4<f16>>(e : vec2<T>) -> vec4<f16> 

T is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#bitcast-builtin)Component-wise reinterpretation of bits as `vec2<f16>`.  
The result is the reintepretation of the 64 bits in `e` as an f16 value, following the internal layout rules.

## Logical Built-in Functions

Function

Parameter Types

Description

 fn all(e: vecN<bool>) -> bool 

[](https://www.w3.org/TR/WGSL/#all-builtin)Returns true if each component of `e` is true.

 fn all(e: bool) -> bool 

[](https://www.w3.org/TR/WGSL/#all-builtin)Returns `e`.

 fn any(e: vecN<bool>) -> bool 

[](https://www.w3.org/TR/WGSL/#any-builtin)Returns true if any component of `e` is true.

 fn any(e: bool) -> bool 

[](https://www.w3.org/TR/WGSL/#any-builtin)Returns `e`.

 fn select(f: T, t: T, cond: bool) -> T 

T is scalar or vector

[](https://www.w3.org/TR/WGSL/#select-builtin)Returns `t` when `cond` is true, and `f` otherwise.

 fn select(f: vecN<T>, t: vecN<T>, cond: vecN<bool>) -> vecN<T> 

T is scalar

[](https://www.w3.org/TR/WGSL/#select-builtin)Component-wise selection. Result component `i` is evaluated as `select(f[i], t[i], cond[i])`.

## Array Built-in Functions

Function

Parameter Types

Description

 fn arrayLength(p: ptr<storage, array<E>, AM>) -> u32 

E is an element type for a runtime-sized array, access mode AM is read or read\_write

[](https://www.w3.org/TR/WGSL/#arrayLength-builtin)Returns NRuntime, the number of elements in the runtime-sized array.

See § 10.3.4 Buffer Binding Determines Runtime-Sized Array Element Count

## Numeric Built-in Functions

Function

Parameter Types

Description

 fn abs(e: T ) -> T 

S is AbstractInt, AbstractFloat, i32, u32, f32, or f16T is S, or vecN<S>

[](https://www.w3.org/TR/WGSL/#abs-float-builtin)The absolute value of `e`. Component-wise when `T` is a vector.

If `e` is a floating-point type, then the result is `e` with a positive sign bit. If `e` is an unsigned integer scalar type, then the result is `e`. If `e` is a signed integer scalar type and evaluates to the largest negative value, then the result is `e`.

 fn acos(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#acos-builtin)

Note: The result is not mathematically meaningful when `abs(e)` > 1.

 fn acosh(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#acosh-builtin)

Note: The result is not mathematically meaningful when `e` < 1.

 fn asin(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#asin-builtin)

Note: The result is not mathematically meaningful when `abs(e)` > 1.

 fn asinh(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#asinh-builtin)Returns the inverse hyperbolic sine (sinh\-1) of `e`, as a hyperbolic angle in radians.  
That is, approximates `x` such that `sinh`(`x`) = `e`.

Component-wise when `T` is a vector.

 fn atan(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#atan-builtin)Returns the principal value, in radians, of the inverse tangent (tan\-1) of `e`.  
That is, approximates `x` with π/2 ≤ `x` ≤ π/2, such that `tan`(`x`) = `e`.

Component-wise when `T` is a vector.

 fn atanh(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#atanh-builtin)

Note: The result is not mathematically meaningful when `abs(e)` ≥ 1.

 fn atan2(y: T, x: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#atan2-builtin)Returns an angle, in radians, in the interval \[-π, π\] whose tangent is `y`÷`x`.

The quadrant selected by the result depends on the signs of `y` and `x`. For example, the function may be implemented as:

*   `atan(y/x)` when `x` > 0
    
*   `atan(y/x)` + π when (`x` < 0) and (`y` > 0)
    
*   `atan(y/x)` - π when (`x` < 0) and (`y` < 0)
    

Note: atan2 is ill-defined when `y/x` is ill-defined, at the origin (`x`,`y`) = (0,0), and when `y` is non-normal or infinite.

Component-wise when `T` is a vector.

 fn ceil(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#ceil-builtin)Returns the ceiling of `e`. Component-wise when `T` is a vector.

 fn clamp(e: T, low: T, high: T) -> T 

S is AbstractInt, AbstractFloat, i32, u32, f32, or f16T is S, or vecN<S>

[](https://www.w3.org/TR/WGSL/#clamp)Restricts the value of `e` within a range.

If `T` is an integer type, then the result is `min(max(e, low), high)`.

If `T` is a floating-point type, then the result is either `min(max(e, low), high)`, or the median of the three values `e`, `low`, `high`.

Component-wise when `T` is a vector.

If `low` is greater than `high`, then:

*   It is a shader-creation error if `low` and `high` are const-expressions.
    
*   It is a pipeline-creation error if `low` and `high` are override-expressions.
    

 fn cos(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#cos-builtin)Returns the cosine of `e`, where `e` is in radians. Component-wise when `T` is a vector.

 fn cosh(arg: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#cosh-builtin)Returns the hyperbolic cosine of `arg`, where `arg` is a hyperbolic angle in radians. Approximates the pure mathematical function (_e_arg + _e_−arg)÷2, but not necessarily computed that way.

Component-wise when `T` is a vector

 fn countLeadingZeros(e: T) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#countLeadingZeros-builtin)The number of consecutive 0 bits starting from the most significant bit of `e`, when `T` is a scalar type.  
Component-wise when `T` is a vector.  
Also known as "clz" in some languages.

 fn countOneBits(e: T) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#countOneBits-builtin)The number of 1 bits in the representation of `e`.  
Also known as "population count".  
Component-wise when `T` is a vector.

 fn countTrailingZeros(e: T) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#countTrailingZeros-builtin)The number of consecutive 0 bits starting from the least significant bit of `e`, when `T` is a scalar type.  
Component-wise when `T` is a vector.  
Also known as "ctz" in some languages.

 fn cross(e1: vec3<T>, e2: vec3<T>) -> vec3<T> 

T is AbstractFloat, f32, or f16

[](https://www.w3.org/TR/WGSL/#cross-builtin)Returns the cross product of `e1` and `e2`.

 fn degrees(e1: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#degrees-builtin)Converts radians to degrees, approximating `e1` × 180 ÷ π. Component-wise when `T` is a vector

 fn determinant(e: matCxC<T>) -> T 

T is AbstractFloat, f32, or f16

[](https://www.w3.org/TR/WGSL/#determinant-builtin)Returns the determinant of `e`.

 fn distance(e1: T, e2: T) -> S 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#distance-builtin)Returns the distance between `e1` and `e2` (e.g. `length(e1 - e2)`).

 fn dot(e1: vecN<T>, e2: vecN<T>) -> T 

T is AbstractInt, AbstractFloat, i32, u32, f32, or f16

[](https://www.w3.org/TR/WGSL/#dot-builtin)Returns the dot product of `e1` and `e2`.

 fn exp(e1: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#exp-builtin)Returns the natural exponentiation of `e1` (e.g. `e``e1`). Component-wise when `T` is a vector.

 fn exp2(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#exp2-builtin)Returns 2 raised to the power `e` (e.g. `2``e`). Component-wise when `T` is a vector.

 fn extractBits(e: T, offset: u32, count: u32) -> T 

T is i32 or vecN<i32>

[](https://www.w3.org/TR/WGSL/#extractBits-signed-builtin)Reads bits from an integer, with sign extension.

When `T` is a scalar type, then:

*   `w` is the bit width of `T`
*   `o = min(offset, w)`
*   `c = min(count, w - o)`
*   The result is 0 if `c` is 0.
*   Otherwise, bits `0..c - 1` of the result are copied from bits `o..o + c - 1` of `e`. Other bits of the result are the same as bit `c - 1` of the result.

Component-wise when `T` is a vector.

If `count` + `offset` is greater than `w`, then:

*   It is a shader-creation error if `count` and `offset` are const-expressions.
    
*   It is a pipeline-creation error if `count` and `offset` are override-expressions.
    

 fn extractBits(e: T, offset: u32, count: u32) -> T 

T is u32 or vecN<u32>

[](https://www.w3.org/TR/WGSL/#extractBits-unsigned-builtin)Reads bits from an integer, without sign extension.

When `T` is a scalar type, then:

*   `w` is the bit width of `T`
*   `o = min(offset, w)`
*   `c = min(count, w - o)`
*   The result is 0 if `c` is 0.
*   Otherwise, bits `0..c - 1` of the result are copied from bits `o..o + c - 1` of `e`. Other bits of the result are 0.

Component-wise when `T` is a vector.

If `count` + `offset` is greater than `w`, then:

*   It is a shader-creation error if `count` and `offset` are const-expressions.
    
*   It is a pipeline-creation error if `count` and `offset` are override-expressions.
    

 fn faceForward(e1: T, e2: T, e3: T) -> T 

T is vecN<AbstractFloat>, vecN<f32>, or vecN<f16>

[](https://www.w3.org/TR/WGSL/#faceForward-builtin)Returns `e1` if `dot(e2, e3)` is negative, and `-e1` otherwise.

 fn firstLeadingBit(e: T) -> T 

T is i32 or vecN<i32>

[](https://www.w3.org/TR/WGSL/#firstLeadingBit-signed-builtin)

Note: Since signed integers use twos-complement representation, the sign bit appears in the most significant bit position.

 fn firstLeadingBit(e: T) -> T 

T is u32 or vecN<u32>

[](https://www.w3.org/TR/WGSL/#firstLeadingBit-unsigned-builtin)For scalar `T`, the result is:

*   `T(-1)` if `e` is zero.
*   Otherwise the position of the most significant 1 bit in `e`.

Component-wise when `T` is a vector.

 fn firstTrailingBit(e: T) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#firstTrailingBit-builtin)For scalar `T`, the result is:

*   `T(-1)` if `e` is zero.
*   Otherwise the position of the least significant 1 bit in `e`.

Component-wise when `T` is a vector.

 fn floor(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#floor-builtin)Returns the floor of `e`. Component-wise when `T` is a vector.

 fn fma(e1: T, e2: T, e3: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#fma-builtin)Returns `e1 * e2 + e3`. Component-wise when `T` is a vector.

Note: The name `fma` is short for "fused multiply add".

Note: The IEEE-754 `fusedMultiplyAdd` operation computes the intermediate results as if with unbounded range and precision, and only the final result is rounded to the destination type. However, the § 14.6.1 Floating Point Accuracy rule for `fma` allows an implementation which performs an ordinary multiply to the target type followed by an ordinary addition. In this case the intermediate values may overflow or lose accuracy, and the overall operation is not "fused" at all.

 fn fract(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#fract-builtin)

Note: Valid results are in the closed interval \[0, 1.0\]. For example, if `e` is a very small negative number, then `fract(e)` may be 1.0.

 fn frexp(e: T) -> \_\_frexp\_result\_f32 

T is f32

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_f32`, but a value may infer the type.

 fn frexp(e: T) -> \_\_frexp\_result\_f16 

T is f16

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_f16`, but a value may infer the type.

 fn frexp(e: T) -> \_\_frexp\_result\_abstract 

T is AbstractFloat

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_abstract`, but a value may infer the type.

 fn frexp(e: T) -> \_\_frexp\_result\_vecN\_f32 

T is vecN<f32>

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_vecN_f32`, but a value may infer the type.

 fn frexp(e: T) -> \_\_frexp\_result\_vecN\_f16 

T is vecN<f16>

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_vecN_f16`, but a value may infer the type.

 fn frexp(e: T) -> \_\_frexp\_result\_vecN\_abstract 

T is vecN<AbstractFloat>

[](https://www.w3.org/TR/WGSL/#frexp-builtin)

Note: A value cannot be explicitly declared with the type `__frexp_result_vecN_abstract`, but a value may infer the type.

 fn insertBits(e: T, newbits: T, offset: u32, count: u32) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#insertBits-builtin)Sets bits in an integer.

When `T` is a scalar type, then:

*   `w` is the bit width of `T`
*   `o = min(offset, w)`
*   `c = min(count, w - o)`
*   The result is `e` if `c` is 0.
*   Otherwise, bits `o..o + c - 1` of the result are copied from bits `0..c - 1` of `newbits`. Other bits of the result are copied from `e`.

Component-wise when `T` is a vector.

If `count` + `offset` is greater than `w`, then:

*   It is a shader-creation error if `count` and `offset` are const-expressions.
    
*   It is a pipeline-creation error if `count` and `offset` are override-expressions.
    

 fn inverseSqrt(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#inverseSqrt-builtin)

Note: The result is not mathematically meaningful if `e` ≤ 0.

 fn ldexp(e1: T, e2: I) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S> I is AbstractInt, i32, vecN<AbstractInt>, or vecN<i32> I is a vector if and only if T is a vector I is concrete if and only if T is a concrete

[](https://www.w3.org/TR/WGSL/#ldexp-builtin)Returns `e1 * 2``e2`, except:

*   The result may be zero if `e2` + _bias_ ≤ 0.
    
*   If `e2` > _bias_ + 1
    
    *   It is a shader-creation error if `e2` is a const-expression.
        
    *   It is a pipeline-creation error if `e2` is an override-expression.
        
    *   Otherwise the result is an indeterminate value for `T`.
        

Here, _bias_ is the exponent bias of the floating point format:

*   15 for `f16`
    
*   127 for `f32`
    
*   1023 for AbstractFloat, when AbstractFloat is IEEE-754 binary64
    

If `x` is zero or a finite normal value for its type, then:

> x = ldexp(frexp(x).fract, frexp(x).exp)

Component-wise when `T` is a vector.

Note: A mnemonic for the name `ldexp` is "load exponent". The name may have been taken from the corresponding instruction in the floating point unit of the PDP-11.

 fn length(e: T) -> S 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#length-builtin)Returns the length of `e`.  
Evaluates to the absolute value of `e` if `T` is scalar.  
Evaluates to `sqrt(e[0]``2` `+ e[1]``2` `+ ...)` if `T` is a vector type.

Note: The scalar case may be evaluated as `sqrt(e * e)`, which may unnecessarily overflow or lose accuracy.

 fn log(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#log-builtin)

Note: The result is not mathematically meaningful if `e` < 0.

 fn log2(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#log2-builtin)

Note: The result is not mathematically meaningful if `e` < 0.

 fn max(e1: T, e2: T) -> T 

S is AbstractInt, AbstractFloat, i32, u32, f32, or f16T is S, or vecN<S>

[](https://www.w3.org/TR/WGSL/#max-float-builtin)Returns `e2` if `e1` is less than `e2`, and `e1` otherwise. Component-wise when `T` is a vector.

If `e1` and `e2` are floating-point values, then:

*   If both `e1` and `e2` are denormalized, then the result may be _either_ value.
    
*   If one operand is a NaN, the other is returned.
    
*   If both operands are NaNs, a NaN is returned.
    

 fn min(e1: T, e2: T) -> T 

S is AbstractInt, AbstractFloat, i32, u32, f32, or f16T is S, or vecN<S>

[](https://www.w3.org/TR/WGSL/#min-float-builtin)Returns `e2` if `e2` is less than `e1`, and `e1` otherwise. Component-wise when `T` is a vector.

If `e1` and `e2` are floating-point values, then:

*   If both `e1` and `e2` are denormalized, then the result may be _either_ value.
    
*   If one operand is a NaN, the other is returned.
    
*   If both operands are NaNs, a NaN is returned.
    

 fn mix(e1: T, e2: T, e3: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#mix-builtin)Returns the linear blend of `e1` and `e2` (e.g. `e1 * (1 - e3) + e2 * e3`). Component-wise when `T` is a vector.

 fn mix(e1: T2, e2: T2, e3: T) -> T2 

T is AbstractFloat, f32, or f16 T2 is vecN<T>

[](https://www.w3.org/TR/WGSL/#mix-builtin)Returns the component-wise linear blend of `e1` and `e2`, using scalar blending factor `e3` for each component.  
Same as `mix(e1, e2, T2(e3))`.

 fn modf(e: T) -> \_\_modf\_result\_f32 

T is f32

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_f32`, but a value may infer the type.

 fn modf(e: T) -> \_\_modf\_result\_f16 

T is f16

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_f16`, but a value may infer the type.

 fn modf(e: T) -> \_\_modf\_result\_abstract 

T is AbstractFloat

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_abstract`, but a value may infer the type.

 fn modf(e: T) -> \_\_modf\_result\_vecN\_f32 

T is vecN<f32>

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_vecN_f32`, but a value may infer the type.

 fn modf(e: T) -> \_\_modf\_result\_vecN\_f16 

T is vecN<f16>

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_vecN_f16`, but a value may infer the type.

 fn modf(e: T) -> \_\_modf\_result\_vecN\_abstract 

T is vecN<AbstractFloat>

[](https://www.w3.org/TR/WGSL/#modf-builtin)

Note: A value cannot be explicitly declared with the type `__modf_result_vecN_abstract`, but a value may infer the type.

 fn normalize(e: vecN<T> ) -> vecN<T> 

T is AbstractFloat, f32, or f16

[](https://www.w3.org/TR/WGSL/#normalize-builtin)Returns a unit vector in the same direction as `e`.

 fn pow(e1: T, e2: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#pow-builtin)Returns `e1` raised to the power `e2`. Component-wise when `T` is a vector.

 fn quantizeToF16(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#quantizeToF16-builtin)

Note: The vec2<f32> case is the same as `unpack2x16float(pack2x16float(e))`.

 fn radians(e1: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#radians-builtin)Converts degrees to radians, approximating `e1` × π ÷ 180. Component-wise when `T` is a vector

 fn reflect(e1: T, e2: T) -> T 

T is vecN<AbstractFloat>, vecN<f32>, or vecN<f16>

[](https://www.w3.org/TR/WGSL/#reflect-builtin)For the incident vector `e1` and surface orientation `e2`, returns the reflection direction `e1 - 2 * dot(e2, e1) * e2`.

 fn refract(e1: T, e2: T, e3: I) -> T 

T is vecN<I> I is AbstractFloat, f32, or f16

[](https://www.w3.org/TR/WGSL/#refract-builtin)For the incident vector `e1` and surface normal `e2`, and the ratio of indices of refraction `e3`, let `k = 1.0 - e3 * e3 * (1.0 - dot(e2, e1) * dot(e2, e1))`. If `k < 0.0`, returns the refraction vector 0.0, otherwise return the refraction vector `e3 * e1 - (e3 * dot(e2, e1) + sqrt(k)) * e2`.

 fn reverseBits(e: T) -> T 

T is i32, u32, vecN<i32>, or vecN<u32>

[](https://www.w3.org/TR/WGSL/#reverseBits-builtin)Reverses the bits in `e`: The bit at position `k` of the result equals the bit at position `31 -k` of `e`.  
Component-wise when `T` is a vector.

 fn round(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#round-builtin)Result is the integer `k` nearest to `e`, as a floating point value.  
When `e` lies halfway between integers `k` and `k + 1`, the result is `k` when `k` is even, and `k + 1` when `k` is odd.  
Component-wise when `T` is a vector.

 fn saturate(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#saturate-float-builtin)Returns `clamp(e, 0.0, 1.0)`. Component-wise when `T` is a vector.

 fn sign(e: T) -> T 

S is AbstractInt, AbstractFloat, i32, f32, or f16T is S, or vecN<S>

[](https://www.w3.org/TR/WGSL/#sign-builtin)Result is:

*   1 when `e` > 0
*   0 when `e` = 0
*   \-1 when `e` < 0

Component-wise when `T` is a vector.

 fn sin(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#sin-builtin)Returns the sine of `e`, where `e` is in radians. Component-wise when `T` is a vector.

 fn sinh(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#sinh-builtin)Returns the hyperbolic sine of `e`, where `e` is a hyperbolic angle in radians. Approximates the pure mathematical function (_e_arg − _e_−arg)÷2, but not necessarily computed that way.

Component-wise when `T` is a vector.

 fn smoothstep(low: T, high: T, x: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#smoothstep-builtin)Returns the smooth Hermite interpolation between 0 and 1. Component-wise when `T` is a vector.

For scalar `T`, the result is `t * t * (3.0 - 2.0 * t)`, where `t = clamp((x - low) / (high - low), 0.0, 1.0)`.

 fn sqrt(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#sqrt-builtin)Returns the square root of `e`. Component-wise when `T` is a vector.

 fn step(edge: T, x: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#step-builtin)Returns 1.0 if `edge` ≤ `x`, and 0.0 otherwise. Component-wise when `T` is a vector.

 fn tan(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#tan-builtin)Returns the tangent of `e`, where `e` is in radians. Component-wise when `T` is a vector.

 fn tanh(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#tanh-builtin)Returns the hyperbolic tangent of `e`, where `e` is a hyperbolic angle in radians. Approximates the pure mathematical function (_e_arg − _e_−arg) ÷ (_e_arg + _e_−arg) but not necessarily computed that way.

Component-wise when `T` is a vector.

 fn transpose(e: matRxC<T>) -> matCxR<T> 

T is AbstractFloat, f32, or f16

[](https://www.w3.org/TR/WGSL/#transpose-builtin)Returns the transpose of `e`.

 fn trunc(e: T) -> T 

S is AbstractFloat, f32, or f16T is S or vecN<S>

[](https://www.w3.org/TR/WGSL/#trunc-builtin)Returns truncate(`e`), the nearest whole number whose absolute value is less than or equal to the absolute value of `e`. Component-wise when `T` is a vector.

## Derivative Built-in Functions

Function

Parameter Types

Description

 fn dpdx(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdx-builtin)Partial derivative of `e` with respect to window x coordinates. The result is the same as either `dpdxFine(e)` or `dpdxCoarse(e)`.

Returns an indeterminate value if called in non-uniform control flow.

 fn dpdxCoarse(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdxCoarse-builtin)Returns the partial derivative of `e` with respect to window x coordinates using local differences. This may result in fewer unique positions that `dpdxFine(e)`.

Returns an indeterminate value if called in non-uniform control flow.

 fn dpdxFine(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdxFine-builtin)Returns the partial derivative of `e` with respect to window x coordinates.

Returns an indeterminate value if called in non-uniform control flow.

 fn dpdy(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdy-builtin)Partial derivative of `e` with respect to window y coordinates. The result is the same as either `dpdyFine(e)` or `dpdyCoarse(e)`.

Returns an indeterminate value if called in non-uniform control flow.

 fn dpdyCoarse(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdyCoarse-builtin)Returns the partial derivative of `e` with respect to window y coordinates using local differences. This may result in fewer unique positions that `dpdyFine(e)`.

Returns an indeterminate value if called in non-uniform control flow.

 fn dpdyFine(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#dpdyFine-builtin)Returns the partial derivative of `e` with respect to window y coordinates.

Returns an indeterminate value if called in non-uniform control flow.

 fn fwidth(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#fwidth-builtin)Returns `abs(dpdx(e)) + abs(dpdy(e))`.

Returns an indeterminate value if called in non-uniform control flow.

 fn fwidthCoarse(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#fwidthCoarse-builtin)Returns `abs(dpdxCoarse(e)) + abs(dpdyCoarse(e))`.

Returns an indeterminate value if called in non-uniform control flow.

 fn fwidthFine(e: T) -> T 

T is f32 or vecN<f32>

[](https://www.w3.org/TR/WGSL/#fwidthFine-builtin)Returns `abs(dpdxFine(e)) + abs(dpdyFine(e))`.

Returns an indeterminate value if called in non-uniform control flow.

## Texture Built-in Functions

Function

Parameter Types

Description

 fn textureDimensions(t: T) -> u32 

ST is i32, u32, or f32 F is a texel format A is an access mode T is texture\_1d<ST> or texture\_storage\_1d<F,A>

[](https://www.w3.org/TR/WGSL/#texturedimensions)

 fn textureDimensions(t: T, level: L) -> u32 

ST is i32, u32, or f32 T is texture\_1d<ST> L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturedimensions)

 fn textureDimensions(t: T) -> vec2<u32> 

ST is i32, u32, or f32 F is a texel format A is an access mode T is texture\_2d<ST>, texture\_2d\_array<ST>, texture\_cube<ST>, texture\_cube\_array<ST>, texture\_multisampled\_2d<ST>, texture\_depth\_2d, texture\_depth\_2d\_array, texture\_depth\_cube, texture\_depth\_cube\_array, texture\_depth\_multisampled\_2d, texture\_storage\_2d<F,A>, texture\_storage\_2d\_array<F,A>, or texture\_external

[](https://www.w3.org/TR/WGSL/#texturedimensions)

 fn textureDimensions(t: T, level: L) -> vec2<u32> 

ST is i32, u32, or f32 T is texture\_2d<ST>, texture\_2d\_array<ST>, texture\_cube<ST>, texture\_cube\_array<ST>, texture\_depth\_2d, texture\_depth\_2d\_array, texture\_depth\_cube, or texture\_depth\_cube\_array L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturedimensions)

 fn textureDimensions(t: T) -> vec3<u32> 

ST is i32, u32, or f32 F is a texel format A is an access mode T is texture\_3d<ST> or texture\_storage\_3d<F,A>

[](https://www.w3.org/TR/WGSL/#texturedimensions)

 fn textureDimensions(t: T, level: L) -> vec3<u32> 

ST is i32, u32, or f32 T is texture\_3d<ST> L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturedimensions)

**Returns:**

The coordinate dimensions of the texture.

That is, the result provides the integer bounds on the coordinates of the logical texel address, excluding the mip level count, array size, and sample count.

For textures based on cubes, the results are the dimensions of each face of the cube. Cube faces are square, so the x and y components of the result are equal.

If `level` is outside the range `[0, textureNumLevels(t))` then an indeterminate value for the return type may be returned.

 fn textureGather(component: C, t: texture\_2d<ST>, s: sampler, coords: vec2<f32>) -> vec4<ST> 

C is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(component: C, t: texture\_2d<ST>, s: sampler, coords: vec2<f32>, offset: vec2<i32>) -> vec4<ST> 

C is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(component: C, t: texture\_2d\_array<ST>, s: sampler, coords: vec2<f32>, array\_index: A) -> vec4<ST> 

C is i32, or u32 A is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(component: C, t: texture\_2d\_array<ST>, s: sampler, coords: vec2<f32>, array\_index: A, offset: vec2<i32>) -> vec4<ST> 

C is i32, or u32 A is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(component: C, t: texture\_cube<ST>, s: sampler, coords: vec3<f32>) -> vec4<ST> 

C is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(component: C, t: texture\_cube\_array<ST>, s: sampler, coords: vec3<f32>, array\_index: A) -> vec4<ST> 

C is i32, or u32 A is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_cube, s: sampler, coords: vec3<f32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegather)

 fn textureGather(t: texture\_depth\_cube\_array, s: sampler, coords: vec3<f32>, array\_index: A) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegather)

**Returns:**

A four component vector with components extracted from the specified channel from the selected texels, as described above.

EXAMPLE: Gather components from texels in 2D texture

@group(0) @binding(0) var t: texture\_2d<f32>;
@group(0) @binding(1) var dt: texture\_depth\_2d;
@group(0) @binding(2) var s: sampler;

fn gather\_x\_components(c: vec2<f32>) -> vec4<f32> {
  return textureGather(0,t,s,c);
}
fn gather\_y\_components(c: vec2<f32>) -> vec4<f32> {
  return textureGather(1,t,s,c);
}
fn gather\_z\_components(c: vec2<f32>) -> vec4<f32> {
  return textureGather(2,t,s,c);
}
fn gather\_depth\_components(c: vec2<f32>) -> vec4<f32> {
  return textureGather(dt,s,c);
}

 fn textureGatherCompare(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

 fn textureGatherCompare(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

 fn textureGatherCompare(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

 fn textureGatherCompare(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

 fn textureGatherCompare(t: texture\_depth\_cube, s: sampler\_comparison, coords: vec3<f32>, depth\_ref: f32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

 fn textureGatherCompare(t: texture\_depth\_cube\_array, s: sampler\_comparison, coords: vec3<f32>, array\_index: A, depth\_ref: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturegathercompare)

**Returns:**

A four component vector with comparison result for the selected texels, as described above.

EXAMPLE: Gather depth comparison

@group(0) @binding(0) var dt: texture\_depth\_2d;
@group(0) @binding(1) var s: sampler;

fn gather\_depth\_compare(c: vec2<f32>, depth\_ref: f32) -> vec4<f32> {
  return textureGatherCompare(dt,s,c,depth\_ref);
}

 fn textureLoad(t: texture\_1d<ST>, coords: C, level: L) -> vec4<ST> 

C is i32, or u32 L is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_2d<ST>, coords: vec2<C>, level: L) -> vec4<ST> 

C is i32, or u32 L is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_2d\_array<ST>, coords: vec2<C>, array\_index: A, level: L) -> vec4<ST> 

C is i32, or u32 A is i32, or u32 L is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_3d<ST>, coords: vec3<C>, level: L) -> vec4<ST> 

C is i32, or u32 L is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_multisampled\_2d<ST>, coords: vec2<C>, sample\_index: S)-> vec4<ST> 

C is i32, or u32 S is i32, or u32 ST is i32, u32, or f32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_depth\_2d, coords: vec2<C>, level: L) -> f32 

C is i32, or u32 L is i32, or u32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_depth\_2d\_array, coords: vec2<C>, array\_index: A, level: L) -> f32 

C is i32, or u32 A is i32, or u32 L is i32, or u32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_depth\_multisampled\_2d, coords: vec2<C>, sample\_index: S)-> f32 

C is i32, or u32 S is i32, or u32

[](https://www.w3.org/TR/WGSL/#textureload)

 fn textureLoad(t: texture\_external, coords: vec2<C>) -> vec4<f32> 

C is i32, or u32

[](https://www.w3.org/TR/WGSL/#textureload)

**Returns:**

The unfiltered texel data.

The logical texel address is invalid if:

*   any element of `coords` is outside the range `[0, textureDimensions(t, level))` for the corresponding element, or
    
*   `array_index` is outside the range `[0, textureNumLayers(t))`, or
    
*   `level` is outside the range `[0, textureNumLevels(t))`, or
    
*   `sample_index` is outside the range `[0, textureNumSamples(s))`
    

If the logical texel addresss is invalid, the built-in function returns one of:

*   The data for some texel within bounds of the texture
    
*   A vector (0,0,0,0) or (0,0,0,1) of the appropriate type for non-depth textures
    
*   0.0 for depth textures
    

 fn textureNumLayers(t: T) -> u32 

F is a texel format A is an access mode ST is i32, u32, or f32 T is texture\_2d\_array<ST>, texture\_cube\_array<ST>, texture\_depth\_2d\_array, texture\_depth\_cube\_array, or texture\_storage\_2d\_array<F,A>

[](https://www.w3.org/TR/WGSL/#texturenumlayers)

**Returns:**

If the texture is based on cubes, returns the number of cubes in the cube arrayed texture.

Otherwise returns the number of layers (homogeneous grids of texels) in the arrayed texture.

 fn textureNumLevels(t: T) -> u32 

ST is i32, u32, or f32 T is texture\_1d<ST>, texture\_2d<ST>, texture\_2d\_array<ST>, texture\_3d<ST>, texture\_cube<ST>, texture\_cube\_array<ST>, texture\_depth\_2d, texture\_depth\_2d\_array, texture\_depth\_cube, or texture\_depth\_cube\_array

[](https://www.w3.org/TR/WGSL/#texturenumlevels)

**Returns:**

The mip level count for the texture.

 fn textureNumSamples(t: T) -> u32 

ST is i32, u32, or f32 T is texture\_multisampled\_2d<ST> or texture\_depth\_multisampled\_2d

[](https://www.w3.org/TR/WGSL/#texturenumsamples)

**Returns:**

The sample count for the multisampled texture.

 fn textureSample(t: texture\_1d<f32>, s: sampler, coords: f32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: T, s: sampler, coords: vec3<f32>) -> vec4<f32> 

T is texture\_3d<f32>, or texture\_cube<f32>

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_3d<f32>, s: sampler, coords: vec3<f32>, offset: vec3<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_cube\_array<f32>, s: sampler, coords: vec3<f32>, array\_index: A) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>, offset: vec2<i32>) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A, offset: vec2<i32>) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_cube, s: sampler, coords: vec3<f32>) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesample)

 fn textureSample(t: texture\_depth\_cube\_array, s: sampler, coords: vec3<f32>, array\_index: A) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesample)

**Returns:**

The sampled value.

An indeterminate value results if called in non-uniform control flow.

 fn textureSampleBias(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, bias: f32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, bias: f32, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, bias: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, bias: f32, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: T, s: sampler, coords: vec3<f32>, bias: f32) -> vec4<f32> 

T is texture\_3d<f32>, or texture\_cube<f32>

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: texture\_3d<f32>, s: sampler, coords: vec3<f32>, bias: f32, offset: vec3<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

 fn textureSampleBias(t: texture\_cube\_array<f32>, s: sampler, coords: vec3<f32>, array\_index: A, bias: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplebias)

**Returns:**

The sampled value.

An indeterminate value results if called in non-uniform control flow.

 fn textureSampleCompare(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

 fn textureSampleCompare(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32, offset: vec2<i32>) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

 fn textureSampleCompare(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

 fn textureSampleCompare(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32, offset: vec2<i32>) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

 fn textureSampleCompare(t: texture\_depth\_cube, s: sampler\_comparison, coords: vec3<f32>, depth\_ref: f32) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

 fn textureSampleCompare(t: texture\_depth\_cube\_array, s: sampler\_comparison, coords: vec3<f32>, array\_index: A, depth\_ref: f32) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecompare)

**Returns:**

A value in the range `[0.0..1.0]`.

Each sampled texel is compared against the reference value using the comparison operator defined by the `sampler_comparison`, resulting in either a `0` or `1` value for each texel.

If the sampler uses bilinear filtering then the returned value is the filtered average of these values, otherwise the comparison result of a single texel is returned.

An indeterminate value results if called in non-uniform control flow.

 fn textureSampleCompareLevel(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

 fn textureSampleCompareLevel(t: texture\_depth\_2d, s: sampler\_comparison, coords: vec2<f32>, depth\_ref: f32, offset: vec2<i32>) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

 fn textureSampleCompareLevel(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

 fn textureSampleCompareLevel(t: texture\_depth\_2d\_array, s: sampler\_comparison, coords: vec2<f32>, array\_index: A, depth\_ref: f32, offset: vec2<i32>) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

 fn textureSampleCompareLevel(t: texture\_depth\_cube, s: sampler\_comparison, coords: vec3<f32>, depth\_ref: f32) -> f32 

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

 fn textureSampleCompareLevel(t: texture\_depth\_cube\_array, s: sampler\_comparison, coords: vec3<f32>, array\_index: A, depth\_ref: f32) -> f32 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplecomparelevel)

**Returns:**

A value in the range `[0.0..1.0]`.

The `textureSampleCompareLevel` function is the same as `textureSampleCompare`, except that:

*   `textureSampleCompareLevel` always samples texels from mip level 0.
    
    *   The function does not compute derivatives.
        
    *   There is no requirement for `textureSampleCompareLevel` to be invoked in uniform control flow.
        
*   `textureSampleCompareLevel` may be invoked in any shader stage.
    

 fn textureSampleGrad(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, ddx: vec2<f32>, ddy: vec2<f32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, ddx: vec2<f32>, ddy: vec2<f32>, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, ddx: vec2<f32>, ddy: vec2<f32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, ddx: vec2<f32>, ddy: vec2<f32>, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: T, s: sampler, coords: vec3<f32>, ddx: vec3<f32>, ddy: vec3<f32>) -> vec4<f32> 

T is texture\_3d<f32>, or texture\_cube<f32>

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: texture\_3d<f32>, s: sampler, coords: vec3<f32>, ddx: vec3<f32>, ddy: vec3<f32>, offset: vec3<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

 fn textureSampleGrad(t: texture\_cube\_array<f32>, s: sampler, coords: vec3<f32>, array\_index: A, ddx: vec3<f32>, ddy: vec3<f32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplegrad)

**Returns:**

The sampled value.

 fn textureSampleLevel(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, level: f32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_2d<f32>, s: sampler, coords: vec2<f32>, level: f32, offset: vec2<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, level: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_2d\_array<f32>, s: sampler, coords: vec2<f32>, array\_index: A, level: f32, offset: vec2<i32>) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: T, s: sampler, coords: vec3<f32>, level: f32) -> vec4<f32> 

T is texture\_3d<f32>, or texture\_cube<f32>

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_3d<f32>, s: sampler, coords: vec3<f32>, level: f32, offset: vec3<i32>) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_cube\_array<f32>, s: sampler, coords: vec3<f32>, array\_index: A, level: f32) -> vec4<f32> 

A is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>, level: L) -> f32 

L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_2d, s: sampler, coords: vec2<f32>, level: L, offset: vec2<i32>) -> f32 

L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A, level: L) -> f32 

A is i32, or u32 L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_2d\_array, s: sampler, coords: vec2<f32>, array\_index: A, level: L, offset: vec2<i32>) -> f32 

A is i32, or u32 L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_cube, s: sampler, coords: vec3<f32>, level: L) -> f32 

L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

 fn textureSampleLevel(t: texture\_depth\_cube\_array, s: sampler, coords: vec3<f32>, array\_index: A, level: L) -> f32 

A is i32, or u32 L is i32, or u32

[](https://www.w3.org/TR/WGSL/#texturesamplelevel)

**Returns:**

The sampled value.

 fn textureSampleBaseClampToEdge(t: T, s: sampler, coords: vec2<f32>) -> vec4<f32> 

T is texture\_2d<f32> or texture\_external

[](https://www.w3.org/TR/WGSL/#textureSampleBaseClampToEdge)

**Returns:**

The sampled value.

 fn textureStore(t: texture\_storage\_1d<F,write>, coords: C, value: vec4<CF>) 

F is a texel format C is i32, or u32 CF depends on the storage texel format F. See the texel format table for the mapping of texel format to channel format.

[](https://www.w3.org/TR/WGSL/#texturestore)

 fn textureStore(t: texture\_storage\_2d<F,write>, coords: vec2<C>, value: vec4<CF>) 

F is a texel format C is i32, or u32 CF depends on the storage texel format F. See the texel format table for the mapping of texel format to channel format.

[](https://www.w3.org/TR/WGSL/#texturestore)

 fn textureStore(t: texture\_storage\_2d\_array<F,write>, coords: vec2<C>, array\_index: A, value: vec4<CF>) 

F is a texel format C is i32, or u32 A is i32, or u32 CF depends on the storage texel format F. See the texel format table for the mapping of texel format to channel format.

[](https://www.w3.org/TR/WGSL/#texturestore)

 fn textureStore(t: texture\_storage\_3d<F,write>, coords: vec3<C>, value: vec4<CF>) 

F is a texel format C is i32, or u32 CF depends on the storage texel format F. See the texel format table for the mapping of texel format to channel format.

[](https://www.w3.org/TR/WGSL/#texturestore)

## Atomic Built-in Functions

Function

Parameter Types

Description

fn atomicLoad(atomic\_ptr: ptr<AS, atomic<T>, read\_write>) -> T 

[](https://www.w3.org/TR/WGSL/#atomic-load)

fn atomicStore(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) 

[](https://www.w3.org/TR/WGSL/#atomic-store)

fn atomicAdd(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicSub(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicMax(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicMin(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicAnd(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicOr(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T fn atomicXor(atomic\_ptr: ptr<AS, atomic<T>, read\_write>, v: T) -> T 

[](https://www.w3.org/TR/WGSL/#atomic-rmw)

## Data Packing Built-in Functions

Function

Parameter Types

Description

 fn pack4x8snorm(e: vec4<f32>) -> u32 

[](https://www.w3.org/TR/WGSL/#pack4x8snorm-builtin)Converts four normalized floating point values to 8-bit signed integers, and then combines them into one `u32` value.  
Component `e[i]` of the input is converted to an 8-bit twos complement integer value ⌊ 0.5 + 127 × min(1, max(-1, e\[i\])) ⌋ which is then placed in bits 8 × `i` through 8 × `i` + 7 of the result.

 fn pack4x8unorm(e: vec4<f32>) -> u32 

[](https://www.w3.org/TR/WGSL/#pack4x8unorm-builtin)Converts four normalized floating point values to 8-bit unsigned integers, and then combines them into one `u32` value.  
Component `e[i]` of the input is converted to an 8-bit unsigned integer value ⌊ 0.5 + 255 × min(1, max(0, e\[i\])) ⌋ which is then placed in bits 8 × `i` through 8 × `i` + 7 of the result.

 fn pack2x16snorm(e: vec2<f32>) -> u32 

[](https://www.w3.org/TR/WGSL/#pack2x16snorm-builtin)Converts two normalized floating point values to 16-bit signed integers, and then combines them into one `u32` value.  
Component `e[i]` of the input is converted to a 16-bit twos complement integer value ⌊ 0.5 + 32767 × min(1, max(-1, e\[i\])) ⌋ which is then placed in bits 16 × `i` through 16 × `i` + 15 of the result.

 fn pack2x16unorm(e: vec2<f32>) -> u32 

[](https://www.w3.org/TR/WGSL/#pack2x16unorm-builtin)Converts two normalized floating point values to 16-bit unsigned integers, and then combines them into one `u32` value.  
Component `e[i]` of the input is converted to a 16-bit unsigned integer value ⌊ 0.5 + 65535 × min(1, max(0, e\[i\])) ⌋ which is then placed in bits 16 × `i` through 16 × `i` + 15 of the result.

 fn pack2x16float(e: vec2<f32>) -> u32 

[](https://www.w3.org/TR/WGSL/#pack2x16float-builtin)Converts two floating point values to half-precision floating point numbers, and then combines them into one `u32` value.  
Component `e[i]` of the input is converted to a IEEE-754 binary16 value, which is then placed in bits 16 × `i` through 16 × `i` + 15 of the result. See § 14.6.2 Floating Point Conversion.

If either `e[0]` or `e[1]` is outside the finite range of binary16 then:

*   It is a shader-creation error if `e` is a const-expression.
    
*   It is a pipeline-creation error if `e` is an override-expression.
    
*   Otherwise the result is an indeterminate value for u32.
    

## Data Unpacking Built-in Functions

Function

Parameter Types

Description

 fn unpack4x8snorm(e: u32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#unpack4x8snorm-builtin)Decomposes a 32-bit value into four 8-bit chunks, then reinterprets each chunk as a signed normalized floating point value.  
Component `i` of the result is max(v ÷ 127, -1), where `v` is the interpretation of bits 8×`i` through 8×`i + 7` of `e` as a twos-complement signed integer.

 fn unpack4x8unorm(e: u32) -> vec4<f32> 

[](https://www.w3.org/TR/WGSL/#unpack4x8unorm-builtin)Decomposes a 32-bit value into four 8-bit chunks, then reinterprets each chunk as an unsigned normalized floating point value.  
Component `i` of the result is `v` ÷ 255, where `v` is the interpretation of bits 8×`i` through 8×`i + 7` of `e` as an unsigned integer.

 fn unpack2x16snorm(e: u32) -> vec2<f32> 

[](https://www.w3.org/TR/WGSL/#unpack2x16snorm-builtin)Decomposes a 32-bit value into two 16-bit chunks, then reinterprets each chunk as a signed normalized floating point value.  
Component `i` of the result is max(v ÷ 32767, -1), where `v` is the interpretation of bits 16×`i` through 16×`i + 15` of `e` as a twos-complement signed integer.

 fn unpack2x16unorm(e: u32) -> vec2<f32> 

[](https://www.w3.org/TR/WGSL/#unpack2x16unorm-builtin)Decomposes a 32-bit value into two 16-bit chunks, then reinterprets each chunk as an unsigned normalized floating point value.  
Component `i` of the result is `v` ÷ 65535, where `v` is the interpretation of bits 16×`i` through 16×`i + 15` of `e` as an unsigned integer.

 fn unpack2x16float(e: u32) -> vec2<f32> 

[](https://www.w3.org/TR/WGSL/#unpack2x16float-builtin)Decomposes a 32-bit value into two 16-bit chunks, and reinterpets each chunk as a floating point value.  
Component `i` of the result is the f32 representation of `v`, where `v` is the interpretation of bits 16×`i` through 16×`i + 15` of `e` as an IEEE-754 binary16 value. See § 14.6.2 Floating Point Conversion.

## Synchronization Built-in Functions

Function

Parameter Types

Description

 fn storageBarrier() 

[](https://www.w3.org/TR/WGSL/#storageBarrier-builtin)Executes a control barrier synchronization function that affects memory and atomic operations in the storage address space.

 fn workgroupBarrier() 

[](https://www.w3.org/TR/WGSL/#workgroupBarrier-builtin)Executes a control barrier synchronization function that affects memory and atomic operations in the workgroup address space.

 fn workgroupUniformLoad(p : ptr<workgroup, T>) -> T 

T is a concrete plain type with a fixed footprint that does not contain any atomic types

[](https://www.w3.org/TR/WGSL/#workgroupUniformLoad-builtin)Returns the value pointed to by `p` to all invocations in the workgroup. The return value is uniform. `p` must be a uniform value.

Executes a control barrier synchronization function that affects memory and atomic operations in the workgroup address space.

### Be aware of undefined behavior in WGSL

Several functions in WGSL are undefined for certain values. Trying to raise a negative number to a power with `pow` is one example since the result would be an imaginary number. We went over another example above with `smoothstep`.

You need to try to be aware of these or else your shaders will get different results on different machines.

Here's a list of undefined some behaviors. Note `T` means `float`, `vec2f`, `vec3f`, or `vec4f`.

fn asin(x: T) -> T

Arc sine. Returns an angle whose sine is x. The range of values returned by this function is \[−π/2, π/2\] Results are undefined if ∣x∣ > 1.

fn acos(x: T) -> T

Arc cosine. Returns an angle whose cosine is x. The range of values returned by this function is \[0, π\]. Results are undefined if ∣x∣ > 1.

fn atan(y: T, x: T) -> T

Arc tangent. Returns an angle whose tangent is y/x. The signs of x and y are used to determine what quadrant the angle is in. The range of values returned by this function is \[−π,π\]. Results are undefined if x and y are both 0.

fn acosh(x: T) -> T

Arc hyperbolic cosine; returns the non-negative inverse of cosh. Results are undefined if x < 1.

fn atanh(x: T) -> T

Arc hyperbolic tangent; returns the inverse of tanh. Results are undefined if ∣x∣≥1.

fn pow(x: T, y: T) -> T

Returns x raised to the y power, i.e., xy. Results are undefined if x < 0. Results are undefined if x = 0 and y <= 0.

fn log(x: T) -> T

Returns the natural log of x. Results are undefined if x < 0.

fn log2(x: T) -> T

Returns the base-2 logarithm of x. Results are undefined if x < 0.

fn log(x: T) -> T

Returns the natural logarithm of x, i.e., returns the value y which satisfies the equation x = ey. Results are undefined if x <= 0.

fn log2(x: T) -> T

Returns the base 2 logarithm of x, i.e., returns the value y which satisfies the equation x=2y. Results are undefined if x <= 0.

fn sqrt(T: x) -> T

Returns √x . Results are undefined if x < 0.

fn inverseSqrt(x: T) -> T

Returns 1/√x. Results are undefined if x <= 0.

fn clamp(x: T, minVal: T, maxVal: T) -> T

Returns min(max(x, minVal), maxVal). Results are undefined if minVal > maxVal

fn smoothstep(edge0: T, edge1: T, x: T) -> T

Returns 0.0 if x <= edge0 and 1.0 if x >= edge1 and performs smooth Hermite interpolation between 0 and 1 when edge0 < x < edge1. Results are undefined if edge0 >= edge1.

[Copyright](https://www.w3.org/Consortium/Legal/ipr-notice#Copyright) © 2023 [World Wide Web Consortium](https://www.w3.org/). W3C® [liability](https://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer), [trademark](https://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks) and [permissive document license](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document) rules apply.

English Spanish 日本語 한국어 Русский Türkçe Українська 简体中文

*   Basics

*   [Fundamentals](/webgpu/lessons/webgpu-fundamentals.html)
*   [Inter-stage Variables](/webgpu/lessons/webgpu-inter-stage-variables.html)
*   [Uniforms](/webgpu/lessons/webgpu-uniforms.html)
*   [Storage Buffers](/webgpu/lessons/webgpu-storage-buffers.html)
*   [Vertex Buffers](/webgpu/lessons/webgpu-vertex-buffers.html)
*   Textures

*   [Textures](/webgpu/lessons/webgpu-textures.html)
*   [Loading Images](/webgpu/lessons/webgpu-importing-textures.html)
*   [Using Video](/webgpu/lessons/webgpu-textures-external-video.html)
*   [Cube Maps](/webgpu/lessons/webgpu-cube-maps.html)
*   [Storage Textures](/webgpu/lessons/webgpu-storage-textures.html)
*   [Multisampling / MSAA](/webgpu/lessons/webgpu-multisampling.html)

*   [Constants](/webgpu/lessons/webgpu-constants.html)
*   [Data Memory Layout](/webgpu/lessons/webgpu-memory-layout.html)
*   [Transparency and Blending](/webgpu/lessons/webgpu-transparency.html)
*   [Bind Group Layouts](/webgpu/lessons/webgpu-bind-group-layouts.html)
*   [Copying Data](/webgpu/lessons/webgpu-copying-data.html)
*   [Optional Features and Limits](/webgpu/lessons/webgpu-limits-and-features.html)
*   [Timing Performance](/webgpu/lessons/webgpu-timing.html)
*   [WGSL](/webgpu/lessons/webgpu-wgsl.html)
*   [How It Works](/webgpu/lessons/webgpu-how-it-works.html)
*   [Compatibility Mode](/webgpu/lessons/webgpu-compatibility-mode.html)

*   3D Math

*   [Translation](/webgpu/lessons/webgpu-translation.html)
*   [Rotation](/webgpu/lessons/webgpu-rotation.html)
*   [Scale](/webgpu/lessons/webgpu-scale.html)
*   [Matrix Math](/webgpu/lessons/webgpu-matrix-math.html)
*   [Orthographic Projection](/webgpu/lessons/webgpu-orthographic-projection.html)
*   [Perspective Projection](/webgpu/lessons/webgpu-perspective-projection.html)
*   [Cameras](/webgpu/lessons/webgpu-cameras.html)
*   [Matrix Stacks](/webgpu/lessons/webgpu-matrix-stacks.html)
*   [Scene Graphs](/webgpu/lessons/webgpu-scene-graphs.html)

*   Lighting

*   [Directional Lighting](/webgpu/lessons/webgpu-lighting-directional.html)
*   [Point Lighting](/webgpu/lessons/webgpu-lighting-point.html)
*   [Spot Lighting](/webgpu/lessons/webgpu-lighting-spot.html)

*   Techniques

*   2D

*   [Large Clip Space Triangle](/webgpu/lessons/webgpu-large-triangle-to-cover-clip-space.html)

*   3D

*   [Environment maps](/webgpu/lessons/webgpu-environment-maps.html)
*   [Skyboxes](/webgpu/lessons/webgpu-skybox.html)

*   Post Processing

*   [Basic CRT Effect](/webgpu/lessons/webgpu-post-processing.html)

*   Compute Shaders

*   [Compute Shader Basics](/webgpu/lessons/webgpu-compute-shaders.html)
*   [Image Histogram](/webgpu/lessons/webgpu-compute-shaders-histogram.html)
*   [Image Histogram Part 2](/webgpu/lessons/webgpu-compute-shaders-histogram-part-2.html)

*   Misc

*   [Resizing the Canvas](/webgpu/lessons/webgpu-resizing-the-canvas.html)
*   [Multiple Canvases](/webgpu/lessons/webgpu-multiple-canvases.html)
*   [Points](/webgpu/lessons/webgpu-points.html)
*   [WebGPU from WebGL](/webgpu/lessons/webgpu-from-webgl.html)
*   [Speed and Optimization](/webgpu/lessons/webgpu-optimization.html)
*   [Debugging and Errors](/webgpu/lessons/webgpu-debugging.html)
*   [Resources / References](/webgpu/lessons/webgpu-resources.html)
*   [WGSL Function Reference](/webgpu/lessons/webgpu-wgsl-function-reference.html)
*   [WGSL Offset Computer](/webgpu/lessons/resources/wgsl-offset-computer.html)

*   [github](https://github.com/webgpu/webgpufundamentals)
*   [Tour of WGSL](https://google.github.io/tour-of-wgsl/)
*   [WebGPU API Reference](https://gpuweb.github.io/types/)
*   [WebGPU Spec](https://www.w3.org/TR/webgpu/)
*   [WGSL Spec](https://www.w3.org/TR/WGSL/)
*   [WebGPUReport.org](https://webgpureport.org)
*   [Web3DSurvey.com](https://web3dsurvey.com/webgpu)

Questions? [Ask on stackoverflow](http://stackoverflow.com/questions/tagged/webgpu).

[Suggestion](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=suggested+topic&template=suggest-topic.md&title=%5BSUGGESTION%5D)? [Request](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=&template=request.md&title=)? [Issue](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=)? [Bug](https://github.com/webgpu/webgpufundamentals/issues/new?assignees=&labels=bug+%2F+issue&template=bug-issue-report.md&title=)?

var disqus\_config = function () { this.page.url = \`${window.location.origin}${window.location.pathname}\`; this.page.identifier = \`WGSL Function Reference\`; }; (function() { // DON'T EDIT BELOW THIS LINE if (window.location.hostname.indexOf("webgpufundamentals.org") < 0) { return; } var d = document, s = d.createElement('script'); s.src = 'https://webgpufundamentals-org.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); })();

Please enable JavaScript to view the [comments powered by Disqus.](http://disqus.com/?ref_noscript)

[comments powered by Disqus](http://disqus.com)

const settings = { contribTemplate: "Thank you <a href=\\"${html\_url}\\"><img src=\\"${avatar\_url}\\"> ${login}</a><br>for <a href=\\"https://github.com/${owner}/${repo}/commits?author=${login}\\">${contributions} contributions</a>", owner: "gfxfundamentals", repo: "webgpufundamentals", }; if (typeof module === 'object') {window.module = module; module = undefined;} window.dataLayer = window.dataLayer || \[\]; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-92BFT5PE4H');