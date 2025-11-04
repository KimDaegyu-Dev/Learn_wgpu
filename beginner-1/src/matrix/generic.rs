use crate::scalar::Scalar;
use std::ops::{Add, Mul, Sub};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Matrix<T: Scalar, const N: usize> {
    pub data: [[T; N]; N],
}

impl<T: Scalar, const N: usize> Matrix<T, N> {
    pub fn new(data: [[T; N]; N]) -> Self {
        Self { data }
    }
    pub fn identity() -> Self {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                if i == j {
                    result[i][j] = T::one();
                } else {
                    result[i][j] = T::zero();
                }
            }
        }
        Self::new(result)
    }
}
// 행렬 덧셈
impl<T: Scalar, const N: usize> Add for Matrix<T, N> {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                result[i][j] = self.data[i][j] + rhs.data[i][j];
            }
        }
        Self::new(result)
    }
}
// 스칼라 덧셈
impl<T: Scalar, const N: usize> Add<T> for Matrix<T, N> {
    type Output = Self;
    fn add(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                result[i][j] = self.data[i][j] + rhs;
            }
        }
        Self::new(result)
    }
}
// 행렬 뺄셈
impl<T: Scalar, const N: usize> Sub for Matrix<T, N> {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                result[i][j] = self.data[i][j] - rhs.data[i][j];
            }
        }
        Self::new(result)
    }
}
// 스칼라 뺄셈
impl<T: Scalar, const N: usize> Sub<T> for Matrix<T, N> {
    type Output = Self;
    fn sub(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                result[i][j] = self.data[i][j] - rhs;
            }
        }
        Self::new(result)
    }
}

// 행렬 * 스칼라
impl<T: Scalar, const N: usize> Mul<T> for Matrix<T, N> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        let mut result = [[T::zero(); N]; N];
        for i in 0..N {
            for j in 0..N {
                result[i][j] = self.data[i][j] * rhs;
            }
        }
        Self::new(result)
    }
}
