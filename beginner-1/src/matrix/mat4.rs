use crate::scalar::Scalar;
use std::ops::{Add, Mul, Sub};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Mat4<T: Scalar> {
    pub m: [[T; 4]; 4],
}

impl<T: Scalar> Mat4<T> {
    pub fn new(m: [[T; 4]; 4]) -> Self {
        Self { m }
    }

    pub fn identity() -> Self {
        Self {
            m: [
                [T::one(), T::zero(), T::zero(), T::zero()],
                [T::zero(), T::one(), T::zero(), T::zero()],
                [T::zero(), T::zero(), T::one(), T::zero()],
                [T::zero(), T::zero(), T::zero(), T::one()],
            ],
        }
    }
}

// 행렬 덧셈
impl<T: Scalar> Add for Mat4<T> {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        let mut result = [[T::zero(); 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                result[i][j] = self.m[i][j] + rhs.m[i][j];
            }
        }
        Self::new(result)
    }
}
// 스칼라 덧셈
impl<T: Scalar> Add<T> for Mat4<T> {
    type Output = Self;
    fn add(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                result[i][j] = self.m[i][j] + rhs;
            }
        }
        Self::new(result)
    }
}

// 행렬 뺄셈
impl<T: Scalar> Sub for Mat4<T> {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        let mut result = [[T::zero(); 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                result[i][j] = self.m[i][j] - rhs.m[i][j];
            }
        }
        Self::new(result)
    }
}
// 스칼라 뺄셈
impl<T: Scalar> Sub<T> for Mat4<T> {
    type Output = Self;
    fn sub(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                result[i][j] = self.m[i][j] - rhs;
            }
        }
        Self::new(result)
    }
}

// Mul (행렬 * 스칼라)
impl<T: Scalar> Mul<T> for Mat4<T> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                result[i][j] = self.m[i][j] * rhs;
            }
        }
        Self::new(result)
    }
}
