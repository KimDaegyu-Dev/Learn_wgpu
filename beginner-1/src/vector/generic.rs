use crate::scalar::Scalar;
use crate::vector::ops::VectorOps;
use crate::vector::{Vec2, Vec3, Vec4};
use std::ops::{Add, Mul, Sub};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Vector<T: Scalar, const N: usize> {
    pub data: [T; N],
}

impl<T: Scalar, const N: usize> Vector<T, N> {
    pub fn new(data: [T; N]) -> Self {
        Self { data }
    }
}

// Add
impl<T: Scalar, const N: usize> Add for Vector<T, N> {
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        let mut result = [T::zero(); N];
        for i in 0..N {
            result[i] = self.data[i] + rhs.data[i];
        }
        Self::new(result)
    }
}

// Sub
impl<T: Scalar, const N: usize> Sub for Vector<T, N> {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        let mut result = [T::zero(); N];
        for i in 0..N {
            result[i] = self.data[i] - rhs.data[i];
        }
        Self::new(result)
    }
}

// Mul (스칼라 곱)
impl<T: Scalar, const N: usize> Mul<T> for Vector<T, N> {
    type Output = Self;
    fn mul(self, rhs: T) -> Self::Output {
        let mut result = [T::zero(); N];
        for i in 0..N {
            result[i] = self.data[i] * rhs;
        }
        Self::new(result)
    }
}

// Product
impl<T: Scalar, const N: usize> Mul for Vector<T, N> {
    type Output = T;
    fn mul(self, rhs: Self) -> T {
        self.dot(&rhs)
    }
}

impl<T: Scalar, const N: usize> VectorOps for Vector<T, N> {
    type Output = T;

    fn dot(&self, rhs: &Self) -> T {
        let mut acc = T::zero();
        for i in 0..N {
            acc = acc + self.data[i] * rhs.data[i];
        }
        acc
    }

    fn hadamard(&self, rhs: &Self) -> Self {
        let mut result = [T::zero(); N];
        for i in 0..N {
            result[i] = self.data[i] * rhs.data[i];
        }
        Self::new(result)
    }

    fn norm(&self) -> T {
        self.dot(self).sqrt()
    }

    fn normalize(&self) -> Self {
        let len = self.norm();
        if len == T::zero() {
            *self
        } else {
            let mut result = [T::zero(); N];
            for i in 0..N {
                result[i] = self.data[i] / len;
            }
            Self::new(result)
        }
    }
}

impl<T: Scalar> From<Vec2<T>> for [T; 2] {
    fn from(v: Vec2<T>) -> Self {
        [v.x, v.y]
    }
}

impl<T: Scalar> From<Vec3<T>> for [T; 3] {
    fn from(v: Vec3<T>) -> Self {
        [v.x, v.y, v.z]
    }
}

impl<T: Scalar> From<Vec4<T>> for [T; 4] {
    fn from(v: Vec4<T>) -> Self {
        [v.x, v.y, v.z, v.w]
    }
}
